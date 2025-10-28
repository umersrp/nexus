import { useState } from 'react';
import Button from '../Button';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

export default function PlanCard({ data, onPurchase = () => {}, selected }) {
  const router = useRouter();
  const { user } = useSelector((state) => state?.authReducer);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div
      className={`
        relative overflow-hidden
        border-2 rounded-xl mb-4
        transition-all duration-300 ease-in-out
        transform hover:scale-105 hover:shadow-2xl
        ${selected 
          ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-lg' 
          : 'border-[var(--primary-color)] bg-white dark:bg-gray-800 hover:border-[var(--primary-color)]/80'
        }
        ${isHovered ? 'shadow-xl' : 'shadow-md'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header Section */}
      <div className={`
        relative h-[120px] rounded-t-xl
        bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-color)]/90
        flex flex-col justify-center items-center text-center
        overflow-hidden
      `}>
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 animate-pulse"></div>
        </div>
        
        <div className="relative z-10">
          <h5 className="text-white text-xl font-bold mb-2 drop-shadow-lg">
            {data?.displayName || data?.name}
          </h5>
          <div className="text-white text-3xl font-bold mb-2 drop-shadow-lg">
            ${data?.price?.monthly || data?.price}
            <span className="text-white/70 text-sm font-normal">/month</span>
          </div>
          <p className="text-white/90 text-sm px-4 line-clamp-2">
            {data?.description}
          </p>
        </div>
        
        {/* Selected badge */}
        {selected && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold animate-bounce">
            ✓ Active
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className={`
        p-6 transition-colors duration-300
        ${selected ? 'bg-green-50 dark:bg-green-900/20' : 'bg-white dark:bg-gray-800'}
      `}>
        <div className="mb-6">
          <h6 className="text-gray-700 dark:text-gray-300 font-semibold mb-4 text-center">
            What's Included
          </h6>
          <ul className="space-y-3 max-h-[180px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {data?.features ? Object.entries(data.features).map(([key, value], i) => {
              if (typeof value === 'boolean') {
                return value ? (
                  <li key={i} className="flex items-center text-gray-700 dark:text-gray-300 text-sm">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="break-words">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  </li>
                ) : null;
              } else if (typeof value === 'number') {
                return (
                  <li key={i} className="flex items-center text-gray-700 dark:text-gray-300 text-sm">
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-white text-xs font-bold">{value}</span>
                    </div>
                    <span className="break-words">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  </li>
                );
              }
              return null;
            }) : data?.description?.map((a, i) => {
              return (
                <li key={i} className="flex items-center text-gray-700 dark:text-gray-300 text-sm">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="break-words">{a}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Button Section */}
        <div className="flex justify-center">
          {selected ? (
            <Button 
              disabled 
              onClick={() => null} 
              variant='secondary'
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Current Plan
              </div>
            </Button>
          ) : (
            <Button
              onClick={async () => {
                setLoading(true);
                await onPurchase();
                setLoading(false);
              }}
              disabled={loading}
              className={`
                w-full font-semibold py-3 px-6 rounded-lg
                transition-all duration-300 transform hover:scale-105
                ${isHovered ? 'shadow-lg' : 'shadow-md'}
                bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-color)]/90
                hover:from-[var(--primary-color)]/90 hover:to-[var(--primary-color)]
                text-white border-0
                ${loading ? 'opacity-75 cursor-not-allowed' : ''}
              `}
            >
              <div className="flex items-center justify-center">
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Get Started
                  </>
                )}
              </div>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
