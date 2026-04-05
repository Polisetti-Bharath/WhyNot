import { supabase } from './supabaseClient';
import { ResumeAnalysis, ResumeAnalysisData } from '../types';
import { analyzeResume, generateResumeSuggestions } from './geminiService';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker with multiple fallback options
try {
  // Try using local worker first
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
} catch (e) {
  // Fallback to unpkg CDN if local fails
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

// ============================================================================
// RESUME FILE HANDLING
// ============================================================================

/**
 * Extract text from PDF file
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Validate file type
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      throw new Error('Invalid file type. Please upload a PDF file.');
    }

    const arrayBuffer = await file.arrayBuffer();

    // Validate arrayBuffer
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error('PDF file is empty or corrupted.');
    }

    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;

    if (!pdf || pdf.numPages === 0) {
      throw new Error('PDF has no pages or is corrupted.');
    }

    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str || '').join(' ');
        fullText += pageText + '\n';
      } catch (pageError) {
        console.warn(`Error extracting page ${pageNum}:`, pageError);
        // Continue with other pages
      }
    }

    const trimmedText = fullText.trim();

    if (!trimmedText || trimmedText.length < 50) {
      throw new Error(
        "PDF appears to be empty or contains no readable text. Try a different PDF or ensure it's not image-based."
      );
    }

    return trimmedText;
  } catch (error: any) {
    console.error('Error extracting PDF text:', error);

    // Provide specific error messages
    if (error.message?.includes('Invalid PDF')) {
      throw new Error('Invalid PDF file format. Please ensure the file is not corrupted.');
    } else if (error.message?.includes('password')) {
      throw new Error('PDF is password-protected. Please upload an unprotected PDF.');
    } else if (error.message) {
      throw error;
    } else {
      throw new Error(
        'Failed to extract text from PDF. The file may be corrupted or image-based. Try converting it to text-based PDF first.'
      );
    }
  }
}

/**
 * Extract text from DOCX file using mammoth.js
 */
export async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
    return result.value.trim();
  } catch (error) {
    console.error('Error extracting DOCX text:', error);
    throw new Error('Failed to extract text from DOCX. Please ensure it is a valid Word document.');
  }
}

/**
 * Extract text from resume file based on format
 */
export async function extractResumeText(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return extractTextFromPDF(file);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return extractTextFromDOCX(file);
  } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return file.text();
  } else {
    throw new Error('Unsupported file format. Please upload PDF, DOCX, or TXT files.');
  }
}

// ============================================================================
// SUPABASE STORAGE
// ============================================================================

/**
 * Upload resume file to Supabase Storage
 */
export async function uploadResumeToStorage(file: File, userId: string): Promise<string> {
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${timestamp}.${fileExt}`;

  const { data, error } = await supabase.storage.from('resumes').upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    console.error('Error uploading resume:', error);
    throw new Error('Failed to upload resume file');
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(fileName);

  return urlData.publicUrl;
}

/**
 * Delete resume file from Supabase Storage
 */
export async function deleteResumeFromStorage(resumeUrl: string): Promise<void> {
  try {
    // Extract file path from URL
    const url = new URL(resumeUrl);
    const pathParts = url.pathname.split('/');
    const fileName = pathParts.slice(-2).join('/'); // Get userId/timestamp.ext

    await supabase.storage.from('resumes').remove([fileName]);
  } catch (error) {
    console.error('Error deleting resume:', error);
    // Don't throw - deletion failure shouldn't block other operations
  }
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/**
 * Save resume analysis to database
 */
export async function saveResumeAnalysis(
  userId: string,
  resumeUrl: string,
  fileName: string,
  analysisData: ResumeAnalysisData,
  suggestions: string[]
): Promise<ResumeAnalysis> {
  const { data, error } = await supabase
    .from('resume_analyses')
    .insert({
      user_id: userId,
      resume_url: resumeUrl,
      file_name: fileName,
      overall_score: analysisData.overallScore,
      analysis_data: analysisData,
      suggestions: suggestions,
      ats_score: analysisData.atsAnalysis.score,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving resume analysis:', error);
    throw new Error('Failed to save analysis to database');
  }

  return data as ResumeAnalysis;
}

/**
 * Get all resume analyses for a user
 */
export async function getUserResumeAnalyses(userId: string): Promise<ResumeAnalysis[]> {
  const { data, error } = await supabase
    .from('resume_analyses')
    .select('*')
    .eq('user_id', userId)
    .order('analyzed_at', { ascending: false });

  if (error) {
    console.error('Error fetching resume analyses:', error);
    throw error;
  }

  return data as ResumeAnalysis[];
}

/**
 * Get a single resume analysis by ID
 */
export async function getResumeAnalysisById(analysisId: string): Promise<ResumeAnalysis | null> {
  const { data, error } = await supabase
    .from('resume_analyses')
    .select('*')
    .eq('id', analysisId)
    .single();

  if (error) {
    console.error('Error fetching resume analysis:', error);
    return null;
  }

  return data as ResumeAnalysis;
}

/**
 * Delete a resume analysis and its associated file
 */
export async function deleteResumeAnalysis(analysisId: string): Promise<void> {
  // First get the analysis to get the resume URL
  const analysis = await getResumeAnalysisById(analysisId);

  if (analysis) {
    // Delete the file from storage
    await deleteResumeFromStorage(analysis.resume_url);

    // Delete the database record
    const { error } = await supabase.from('resume_analyses').delete().eq('id', analysisId);

    if (error) {
      console.error('Error deleting resume analysis:', error);
      throw error;
    }
  }
}

// ============================================================================
// COMPLETE ANALYSIS WORKFLOW
// ============================================================================

/**
 * Complete workflow: Upload resume, extract text, analyze, and save
 */
export async function analyzeAndSaveResume(
  file: File,
  userId: string,
  targetRole: string = 'General'
): Promise<ResumeAnalysis> {
  try {
    // 1. Upload file to storage
    const resumeUrl = await uploadResumeToStorage(file, userId);

    // 2. Extract text from file
    const resumeText = await extractResumeText(file);

    if (!resumeText || resumeText.trim().length < 100) {
      throw new Error(
        'Could not extract enough text from resume. Please ensure the file contains readable text.'
      );
    }

    // 3. Analyze with AI
    const analysisData = await analyzeResume(resumeText, targetRole, userId);

    // 4. Generate suggestions
    const suggestions = generateResumeSuggestions(analysisData);

    // 5. Save to database
    const savedAnalysis = await saveResumeAnalysis(
      userId,
      resumeUrl,
      file.name,
      analysisData,
      suggestions
    );

    return savedAnalysis;
  } catch (error) {
    console.error('Error in complete analysis workflow:', error);
    throw error;
  }
}

/**
 * Compare two resume analyses to show improvement
 */
export function compareResumeAnalyses(
  oldAnalysis: ResumeAnalysis,
  newAnalysis: ResumeAnalysis
): {
  scoreDifference: number;
  atsScoreDifference: number;
  improvements: string[];
  remainingIssues: string[];
} {
  const scoreDiff = newAnalysis.overall_score - oldAnalysis.overall_score;
  const atsScoreDiff = newAnalysis.ats_score - oldAnalysis.ats_score;

  const improvements: string[] = [];
  const remainingIssues: string[] = [];

  // Compare section scores
  newAnalysis.analysis_data.sectionScores.forEach(newSection => {
    const oldSection = oldAnalysis.analysis_data.sectionScores.find(
      s => s.name === newSection.name
    );

    if (oldSection && newSection.score > oldSection.score) {
      improvements.push(
        `${newSection.name} improved by ${newSection.score - oldSection.score} points`
      );
    } else if (newSection.score < 70) {
      remainingIssues.push(`${newSection.name} still needs work (${newSection.score}/100)`);
    }
  });

  // Check ATS improvements
  if (atsScoreDiff > 0) {
    improvements.push(`ATS compatibility improved by ${atsScoreDiff} points`);
  } else if (newAnalysis.ats_score < 70) {
    remainingIssues.push(`ATS score still below 70 (${newAnalysis.ats_score}/100)`);
  }

  return {
    scoreDifference: scoreDiff,
    atsScoreDifference: atsScoreDiff,
    improvements,
    remainingIssues,
  };
}
