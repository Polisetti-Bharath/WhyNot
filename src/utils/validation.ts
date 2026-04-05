/**
 * Form Validation Utilities
 * Centralized validation logic for all forms in the application
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Email validation
 */
export const validateEmail = (email: string): ValidationError | null => {
  if (!email) {
    return { field: 'email', message: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { field: 'email', message: 'Please enter a valid email address' };
  }

  return null;
};

/**
 * Password validation
 */
export const validatePassword = (password: string): ValidationError | null => {
  if (!password) {
    return { field: 'password', message: 'Password is required' };
  }

  if (password.length < 8) {
    return { field: 'password', message: 'Password must be at least 8 characters long' };
  }

  if (!/[A-Z]/.test(password)) {
    return { field: 'password', message: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { field: 'password', message: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { field: 'password', message: 'Password must contain at least one number' };
  }

  return null;
};

/**
 * Name validation
 */
export const validateName = (name: string): ValidationError | null => {
  if (!name || name.trim().length === 0) {
    return { field: 'name', message: 'Name is required' };
  }

  if (name.trim().length < 2) {
    return { field: 'name', message: 'Name must be at least 2 characters long' };
  }

  if (!/^[a-zA-Z\s]+$/.test(name)) {
    return { field: 'name', message: 'Name must contain only letters and spaces' };
  }

  return null;
};

/**
 * Phone number validation
 */
export const validatePhone = (phone: string): ValidationError | null => {
  if (!phone) {
    return null; // Phone is optional
  }

  const phoneRegex = /^[+]?[\d\s-()]{10,15}$/;
  if (!phoneRegex.test(phone)) {
    return { field: 'phone', message: 'Please enter a valid phone number' };
  }

  return null;
};

/**
 * CGPA validation
 */
export const validateCGPA = (cgpa: number | string): ValidationError | null => {
  if (cgpa === '' || cgpa === null || cgpa === undefined) {
    return { field: 'cgpa', message: 'CGPA is required' };
  }

  const cgpaNum = typeof cgpa === 'string' ? parseFloat(cgpa) : cgpa;

  if (isNaN(cgpaNum)) {
    return { field: 'cgpa', message: 'CGPA must be a valid number' };
  }

  if (cgpaNum < 0 || cgpaNum > 10) {
    return { field: 'cgpa', message: 'CGPA must be between 0 and 10' };
  }

  return null;
};

/**
 * Year validation
 */
export const validateYear = (year: number | string): ValidationError | null => {
  if (year === '' || year === null || year === undefined) {
    return { field: 'year', message: 'Year is required' };
  }

  const yearNum = typeof year === 'string' ? parseInt(year) : year;

  if (isNaN(yearNum)) {
    return { field: 'year', message: 'Year must be a valid number' };
  }

  if (yearNum < 1 || yearNum > 5) {
    return { field: 'year', message: 'Year must be between 1 and 5' };
  }

  return null;
};

/**
 * Required field validation
 */
export const validateRequired = (
  value: any,
  fieldName: string,
  displayName?: string
): ValidationError | null => {
  if (
    value === '' ||
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim().length === 0)
  ) {
    return {
      field: fieldName,
      message: `${displayName || fieldName} is required`,
    };
  }

  return null;
};

/**
 * URL validation
 */
export const validateURL = (url: string, fieldName: string = 'url'): ValidationError | null => {
  if (!url) {
    return null; // URL is optional unless specified otherwise
  }

  try {
    new URL(url);
    return null;
  } catch {
    return { field: fieldName, message: 'Please enter a valid URL' };
  }
};

/**
 * Number range validation
 */
export const validateNumberRange = (
  value: number | string,
  fieldName: string,
  min?: number,
  max?: number,
  displayName?: string
): ValidationError | null => {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return { field: fieldName, message: `${displayName || fieldName} must be a valid number` };
  }

  if (min !== undefined && num < min) {
    return { field: fieldName, message: `${displayName || fieldName} must be at least ${min}` };
  }

  if (max !== undefined && num > max) {
    return { field: fieldName, message: `${displayName || fieldName} must be at most ${max}` };
  }

  return null;
};

/**
 * Login form validation
 */
export const validateLoginForm = (email: string, password: string): ValidationResult => {
  const errors: ValidationError[] = [];

  const emailError = validateEmail(email);
  if (emailError) errors.push(emailError);

  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Signup form validation
 */
export const validateSignupForm = (
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
  role: string
): ValidationResult => {
  const errors: ValidationError[] = [];

  const nameError = validateName(name);
  if (nameError) errors.push(nameError);

  const emailError = validateEmail(email);
  if (emailError) errors.push(emailError);

  const passwordError = validatePassword(password);
  if (passwordError) errors.push(passwordError);

  if (password !== confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }

  if (!role) {
    errors.push({ field: 'role', message: 'Please select a role' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Profile form validation
 */
export const validateProfileForm = (data: {
  name?: string;
  email?: string;
  phone?: string;
  cgpa?: number | string;
  year?: number | string;
  major?: string;
}): ValidationResult => {
  const errors: ValidationError[] = [];

  if (data.name !== undefined) {
    const nameError = validateName(data.name);
    if (nameError) errors.push(nameError);
  }

  if (data.email !== undefined) {
    const emailError = validateEmail(data.email);
    if (emailError) errors.push(emailError);
  }

  if (data.phone !== undefined) {
    const phoneError = validatePhone(data.phone);
    if (phoneError) errors.push(phoneError);
  }

  if (data.cgpa !== undefined) {
    const cgpaError = validateCGPA(data.cgpa);
    if (cgpaError) errors.push(cgpaError);
  }

  if (data.year !== undefined) {
    const yearError = validateYear(data.year);
    if (yearError) errors.push(yearError);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Opportunity form validation
 */
export const validateOpportunityForm = (data: {
  title: string;
  company_name: string;
  description: string;
  type: string;
  min_cgpa?: number | string;
  location?: string;
  deadline?: string;
}): ValidationResult => {
  const errors: ValidationError[] = [];

  const titleError = validateRequired(data.title, 'title', 'Job Title');
  if (titleError) errors.push(titleError);

  const companyError = validateRequired(data.company_name, 'company_name', 'Company Name');
  if (companyError) errors.push(companyError);

  const descError = validateRequired(data.description, 'description', 'Description');
  if (descError) errors.push(descError);

  const typeError = validateRequired(data.type, 'type', 'Type');
  if (typeError) errors.push(typeError);

  if (data.min_cgpa !== undefined && data.min_cgpa !== '') {
    const cgpaError = validateCGPA(data.min_cgpa);
    if (cgpaError) {
      errors.push({ ...cgpaError, field: 'min_cgpa' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get error message for a specific field
 */
export const getFieldError = (errors: ValidationError[], fieldName: string): string | undefined => {
  const error = errors.find(err => err.field === fieldName);
  return error?.message;
};

/**
 * Check if field has error
 */
export const hasFieldError = (errors: ValidationError[], fieldName: string): boolean => {
  return errors.some(err => err.field === fieldName);
};
