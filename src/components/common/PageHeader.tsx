import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  action?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  action,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="mb-6 md:mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="mr-3 p-1 rounded-full hover:bg-gray-100 text-navy-600 transition-colors"
              aria-label="Revenir en arrière"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-navy-900">{title}</h1>
            {subtitle && <p className="text-navy-500 mt-1">{subtitle}</p>}
          </div>
        </div>
        {action && <div className="flex">{action}</div>}
      </div>
    </div>
  );
};

export default PageHeader;