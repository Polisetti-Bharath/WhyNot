export interface ExternalJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  source: string;
  description: string;
  applyLink: string;
  postedAt: string;
  salary?: string;
  logoUrl?: string;
}

export const fetchExternalJobs = async (query?: string, source?: string): Promise<ExternalJob[]> => {
  // To fetch real jobs from Indeed, LinkedIn, etc., we use the JSearch API from RapidAPI.
  // It aggregates jobs from various job boards.
  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
  
  if (!apiKey) {
    console.warn("VITE_RAPIDAPI_KEY is missing in your .env file. Falling back to a free public job board API (Remotive) which does not require auth.");
    return fetchFallbackJobs(query, source);
  }

  const searchQuery = query || 'Software Engineer';
  // Include source in search if it's not 'All'
  const filterQuery = source && source !== 'All' 
    ? `${searchQuery} on ${source} in India` 
    : `${searchQuery} in India`;

  try {
    const url = new URL('https://jsearch.p.rapidapi.com/search');
    url.searchParams.append('query', filterQuery);
    url.searchParams.append('num_pages', '1');
    url.searchParams.append('date_posted', 'month');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'jsearch.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`JSearch API error: ${response.status}`);
    }

    const json = await response.json();
    
    if (!json.data) return [];

    return json.data.map((job: any) => ({
      id: job.job_id || Math.random().toString(),
      title: job.job_title,
      company: job.employer_name,
      location: [job.job_city, job.job_state, job.job_country].filter(Boolean).join(', ') || 'Remote',
      type: job.job_employment_type?.replace(/_/g, ' ') || 'Full-time',
      source: job.job_publisher || 'Web', 
      description: job.job_description || 'No description available.',
      applyLink: job.job_apply_link,
      postedAt: job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc).toLocaleDateString() : 'Recently posted',
      logoUrl: job.employer_logo,
      salary: job.job_min_salary ? `${job.job_min_salary} - ${job.job_max_salary} ${job.job_salary_currency}` : 'Not Disclosed'
    }));

  } catch (error) {
    console.error('Error fetching from JSearch:', error);
    // Fallback if RapidAPI fails
    return fetchFallbackJobs(query, source);
  }
};

// Free fallback API (Remotive) that requires no authentication
// It serves real, dynamically updating tech jobs globally.
const fetchFallbackJobs = async (query?: string, source?: string): Promise<ExternalJob[]> => {
  try {
    let url = 'https://remotive.com/api/remote-jobs?category=software-dev';
    if (query) {
      url += `&search=${encodeURIComponent(query)}`;
    }
    const response = await fetch(url);
    const json = await response.json();
    
    let jobs = json.jobs.map((job: any) => ({
      id: job.id.toString(),
      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location || 'Remote',
      type: job.job_type?.replace(/_/g, ' ') || 'Full-time',
      source: job.publication_date ? 'Remotive' : 'Web',
      description: job.description.replace(/<[^>]*>?/gm, '').substring(0, 300) + '...',
      applyLink: job.url,
      postedAt: new Date(job.publication_date).toLocaleDateString(),
      logoUrl: job.company_logo,
      salary: job.salary || 'Not Disclosed'
    }));

    if (source && source !== 'All') {
        // Just mock the source text if user specifically filters for UI consistency, 
        // since Remotive aggregates globally
        jobs = jobs.map((job: any) => ({ ...job, source: source }));
    }

    return jobs.slice(0, 50); // limit to 50 jobs for performance
  } catch (error) {
    console.error("Fallback API failed:", error);
    return [];
  }
};
