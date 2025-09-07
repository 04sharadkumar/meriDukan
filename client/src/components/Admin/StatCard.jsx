import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router-dom';

const StatCards = ({ icon, label, value, link, trend, loading, currency }) => {
  const TrendIcon = trend > 0 ? FiTrendingUp : FiTrendingDown;
  
  return (
    <Link to={link} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full border border-gray-100">
      <div className="flex justify-between items-start">
        <div className="text-2xl text-blue-600 bg-blue-50 p-3 rounded-lg">{icon}</div>
        {trend !== undefined && (
          <div className={`text-xs px-2 py-1 rounded-full flex items-center ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            <TrendIcon size={14} className="mr-1" />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        {loading ? (
          <Skeleton width={80} height={28} className="mt-1" />
        ) : (
          <h3 className="text-2xl font-bold text-gray-900 mt-1">
            {currency && '₹'}
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
        )}
      </div>
    </Link>
  );
};

export default StatCards;