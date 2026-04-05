/**
 * Component Index - Centralized exports for all components
 * Professional folder structure with organized imports
 */

// Common UI Components
export { default as Button } from './common/Button';
export { default as LoadingSpinner } from './common/LoadingSpinner';
export { default as SkeletonLoader } from './common/SkeletonLoader';
export { default as EmptyState } from './common/EmptyState';
export { default as Breadcrumbs } from './common/Breadcrumbs';
export { default as Tooltip } from './common/Tooltip';
export { default as SearchFilter } from './common/SearchFilter';
export { default as SEO } from './common/SEO';
export { default as ErrorBoundary } from './common/ErrorBoundary';
export { default as ProtectedRoute } from './common/ProtectedRoute';
export { default as PageTransition } from './common/PageTransition';
export { LoadingGrid, CardSkeleton } from './common/LoadingSkeleton';
export { default as ParticleBackground } from './common/ParticleBackground';
export { default as ThreeScene } from './common/ThreeScene';

// Layout Components
export { default as Header } from './layout/Header';
export { default as Footer } from './layout/Footer';
export { default as Sidebar } from './layout/Sidebar';

// Modal Components
export { default as ApplyModal } from './modals/ApplyModal';
export { default as ExplanationModal } from './modals/ExplanationModal';

// Feature-Specific Components
export { default as RejectionAnalysisHub } from './features/RejectionAnalysisHub';
export { default as ResumeAnalysisCard } from './features/ResumeAnalysisCard';
export { default as ResumeUpload } from './features/ResumeUpload';
export { default as NotificationBell } from './features/NotificationBell';

// Type Exports
export type { BreadcrumbItem } from './common/Breadcrumbs';
export type { FilterOption, FilterGroup } from './common/SearchFilter';
