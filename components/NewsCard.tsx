import { format } from 'date-fns';
import Link from 'next/link';

interface NewsCardProps {
  title: string;
  summary: string;
  date: string;
  link: string;
  source: string;
  category?: string;
  featured?: boolean;
}

export default function NewsCard({
  title,
  summary,
  date,
  link,
  source,
  category,
  featured = false,
}: NewsCardProps) {
  const formattedDate = date ? format(new Date(date), 'MMM dd, yyyy') : 'Date not available';

  return (
    <div
      className={`
        bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300
        p-6 border-l-4
        ${featured ? 'border-primary-gold' : 'border-primary-green'}
        ${featured ? 'ring-2 ring-primary-gold ring-opacity-50' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
            {title}
          </h3>
          <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
            <span className="font-semibold text-primary-green">{source}</span>
            {category && (
              <span className="px-2 py-1 bg-primary-green bg-opacity-10 text-primary-green rounded-full text-xs">
                {category}
              </span>
            )}
            <span className="text-gray-400">•</span>
            <span>{formattedDate}</span>
          </div>
        </div>
        {featured && (
          <span className="ml-2 px-3 py-1 bg-primary-gold text-white rounded-full text-xs font-bold">
            Featured
          </span>
        )}
      </div>

      <p className="text-gray-700 mb-4 line-clamp-3">{summary}</p>

      <div className="flex items-center justify-between">
        <Link
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="
            inline-flex items-center gap-2 text-primary-green font-semibold
            hover:text-primary-gold transition-colors duration-200
          "
        >
          <span>View Source</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLineCap="round"
              strokeLineJoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </Link>

        <button
          className="
            px-4 py-2 bg-primary-green text-white rounded-lg
            hover:bg-opacity-90 transition-all duration-200
            font-medium text-sm
          "
        >
          Subscribe for Alerts
        </button>
      </div>
    </div>
  );
}

