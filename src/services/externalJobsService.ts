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
  roleCategory?: string;
}

export const determineRoleCategory = (title: string): string => {
  const t = title.toLowerCase();
  if (
    t.includes('frontend') ||
    t.includes('front-end') ||
    t.includes('react') ||
    t.includes('vue') ||
    t.includes('angular') ||
    t.includes('ui')
  )
    return 'Frontend';
  if (
    t.includes('backend') ||
    t.includes('back-end') ||
    t.includes('node') ||
    t.includes('java ') ||
    t.includes('python') ||
    t.includes('ruby') ||
    t.includes('golang')
  )
    return 'Backend';
  if (t.includes('full stack') || t.includes('fullstack') || t.includes('full-stack'))
    return 'Full Stack';
  if (
    t.includes('data') ||
    t.includes('machine learning') ||
    t.includes('ml') ||
    t.includes('ai ') ||
    t.includes('artificial intelligence') ||
    t.includes('analyst')
  )
    return 'Data & AI';
  if (
    t.includes('mobile') ||
    t.includes('ios') ||
    t.includes('android') ||
    t.includes('flutter') ||
    t.includes('react native')
  )
    return 'Mobile';
  if (
    t.includes('devops') ||
    t.includes('cloud') ||
    t.includes('aws') ||
    t.includes('azure') ||
    t.includes('sre')
  )
    return 'DevOps & Cloud';
  return 'Other Software';
};

export const fetchExternalJobs = async (
  query?: string,
  source?: string
): Promise<ExternalJob[]> => {
  const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;

  if (!apiKey || apiKey === 'YOUR_RAPID_API_KEY_HERE') {
    console.warn('VITE_RAPIDAPI_KEY is missing in .env. Falling back to mock jobs data.');
    return fetchFallbackJobs(query);
  }

  const searchQuery = query || 'Software Engineer';
  const filterQuery =
    source && source !== 'All' ? `${searchQuery} on ${source} in India` : `${searchQuery} in India`;

  try {
    const url = new URL('https://jsearch.p.rapidapi.com/search');
    url.searchParams.append('query', filterQuery);
    url.searchParams.append('num_pages', '1');
    url.searchParams.append('date_posted', 'month');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'jsearch.p.rapidapi.com',
      },
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
      location:
        [job.job_city, job.job_state, job.job_country].filter(Boolean).join(', ') || 'Remote',
      type: job.job_employment_type?.replace(/_/g, ' ') || 'Full-time',
      source: job.job_publisher || 'Web',
      description: job.job_description || 'No description available.',
      applyLink: job.job_apply_link,
      postedAt: job.job_posted_at_datetime_utc
        ? new Date(job.job_posted_at_datetime_utc).toLocaleDateString()
        : 'Recently posted',
      salary: job.job_min_salary
        ? `${job.job_min_salary} - ${job.job_max_salary} ${job.job_salary_currency}`
        : 'Not Disclosed',
      roleCategory: determineRoleCategory(job.job_title),
    }));
  } catch (error) {
    return fetchFallbackJobs(query);
  }
};

const fetchFallbackJobs = async (query?: string): Promise<ExternalJob[]> => {
  try {
    const endpoints = [
      'https://remotive.com/api/remote-jobs?category=software-dev',
      'https://remotive.com/api/remote-jobs?category=data',
    ];

    const responses = await Promise.all(
      endpoints.map(async endpoint => {
        let url = endpoint;
        if (query) url += `&search=${encodeURIComponent(query)}`;
        const res = await fetch(url);
        return res.json();
      })
    );

    const allJobs = responses.flatMap(json => json.jobs || []);

    const fetchedJobs: ExternalJob[] = allJobs.map((job: any) => ({
      id: job.id.toString(),
      title: job.title,
      company: job.company_name,
      location: job.candidate_required_location || 'Remote',
      type: job.job_type?.replace(/_/g, ' ') || 'Full-time',
      source: 'Remotive',
      description: job.description.replace(/<[^>]*>?/gm, '').substring(0, 300) + '...',
      applyLink: job.url,
      postedAt: new Date(job.publication_date).toLocaleDateString(),
      salary: job.salary || 'Not Disclosed',
      roleCategory: determineRoleCategory(job.title),
    }));

    fetchedJobs.sort(
      (a: ExternalJob, b: ExternalJob) =>
        new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
    );

    return fetchedJobs.slice(0, 200);
  } catch (error) {
    return [];
  }
};
