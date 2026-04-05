import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb navigation component for deep navigation
 * @param items - Array of breadcrumb items with label and optional path
 * @param className - Additional CSS classes
 */
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-2 text-sm ${className}`}>
      <ol className="flex items-center gap-2">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black rounded px-1"
            aria-label="Home"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={index}>
              <li aria-hidden="true">
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </li>
              <li>
                {isLast || !item.path ? (
                  <span
                    className="flex items-center gap-1 text-white font-medium"
                    aria-current="page"
                  >
                    {item.icon}
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.path}
                    className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black rounded px-1"
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
