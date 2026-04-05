import { supabase } from './supabaseClient';

const BUCKET_NAME = 'resumes';

/**
 * Initialize storage bucket (should be done once in Supabase dashboard)
 */
export const initializeStorage = async () => {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(bucket => bucket.name === BUCKET_NAME);

  if (!exists) {
    await supabase.storage.createBucket(BUCKET_NAME, {
      public: false,
      fileSizeLimit: 10485760, // 10MB
    });
  }
};

/**
 * Upload resume file to Supabase Storage
 * @param userId - User ID for unique file path
 * @param file - Resume file (PDF)
 * @returns Public URL of uploaded file or null
 */
export const uploadResume = async (userId: string, file: File): Promise<string | null> => {
  try {
    // Validate file type
    if (file.type !== 'application/pdf') {
      throw new Error('Only PDF files are allowed');
    }

    // Validate file size (10MB max)
    if (file.size > 10485760) {
      throw new Error('File size must be less than 10MB');
    }

    // Create unique file path
    const fileExt = 'pdf';
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload file
    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    // Update user profile with resume URL
    await supabase
      .from('student_profiles')
      .update({ resume_url: urlData.publicUrl })
      .eq('id', userId);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading resume:', error);
    return null;
  }
};

/**
 * Download resume file
 * @param resumeUrl - URL of the resume
 * @param fileName - Name for downloaded file
 */
export const downloadResume = async (resumeUrl: string, fileName: string = 'resume.pdf') => {
  try {
    const response = await fetch(resumeUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error downloading resume:', error);
    throw error;
  }
};

/**
 * Delete resume file
 * @param userId - User ID
 * @param resumeUrl - URL of resume to delete
 */
export const deleteResume = async (userId: string, resumeUrl: string): Promise<boolean> => {
  try {
    // Extract file path from URL
    const urlParts = resumeUrl.split('/');
    const filePath = `${userId}/${urlParts[urlParts.length - 1]}`;

    // Delete from storage
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

    if (error) throw error;

    // Update profile
    await supabase.from('student_profiles').update({ resume_url: null }).eq('id', userId);

    return true;
  } catch (error) {
    console.error('Error deleting resume:', error);
    return false;
  }
};

/**
 * Get signed URL for private resume viewing
 * @param filePath - Path to file in storage
 * @param expiresIn - Seconds until URL expires (default 1 hour)
 */
export const getSignedResumeUrl = async (
  filePath: string,
  expiresIn: number = 3600
): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, expiresIn);

    if (error) throw error;
    return data.signedUrl;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    return null;
  }
};
