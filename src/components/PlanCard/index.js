import { useState } from 'react';
import Button from '../Button';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

export default function PlanCard({ data, onPurchase = () => {}, selected }) {
  const router = useRouter();
  const { user } = useSelector((state) => state?.authReducer);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const primary = '#023789';
  const primaryLight = '#2b63cc';
  const accent = '#20c997';
  const danger = '#ef4444';
  const priceMonthly = data?.price?.monthly || data?.price;
  const title = data?.displayName || data?.name;
  const description = Array.isArray(data?.description) ? null : data?.description;

  const isFeatured = /plus|premium|pro/i.test(title || '') || /plus|premium|pro/i.test(data?.name || '');

  // Transform features into display-friendly list, showing both true/false
  const featureItems = (() => {
    if (!data?.features) return null;
    return Object.entries(data.features).map(([key, value]) => ({
      label: key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase()),
      type: typeof value,
      value,
    }));
  })();

  return (
    <div
      className={`
        group relative overflow-hidden bg-white
        rounded-[28px] mb-4 border
        transition-all duration-300 ease-out
        ${selected ? 'border-green-500 shadow-xl ring-2 ring-green-400/40' : 'border-slate-200 shadow-sm hover:shadow-xl'}
        ${isHovered && !selected ? 'translate-y-[-3px]' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Featured ribbon */}
      {isFeatured && !selected && (
        <div
          className="absolute -right-12 top-4 rotate-45 text-white text-[11px] tracking-wide px-10 py-1 shadow"
          style={{ background: 'linear-gradient(90deg, #f59e0b, #f97316)' }}
        >
          BEST VALUE
        </div>
      )}

      {/* Decorative top bars */}
      <div className="absolute left-4 right-4 top-3 flex items-center justify-between pointer-events-none">
        <div style={{ background: '#cfd5e3' }} className="h-[10px] w-20 rounded-full" />
        <div style={{ background: '#cfd5e3' }} className="h-[10px] w-12 rounded-full" />
      </div>

      {/* Header with gradient and capsules */}
      <div
        className="relative pt-9 pb-6 px-5 text-center rounded-t-[28px]"
        style={{
          background: `linear-gradient(180deg, ${primaryLight} 0%, ${primary} 100%)`,
        }}
      >
        {/* Title capsule */}
        <div className="flex justify-center">
          <div
            className="inline-flex items-center px-6 py-2 rounded-full text-white font-semibold text-lg shadow backdrop-blur-[1px]"
            style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)' }}
          >
            {title}
          </div>
        </div>

        {/* Price capsule */}
        <div className="mt-3 flex justify-center">
          <div
            className="inline-flex items-end gap-1 px-6 py-2 rounded-[18px] text-white font-extrabold text-[30px] tracking-tight shadow"
            style={{ backgroundColor: 'rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            ${priceMonthly}
            <span className="text-sm font-medium opacity-90">/month</span>
          </div>
        </div>

        {description && (
          <p className="mt-2 text-white/90 text-[12px] leading-snug break-words truncate max-w-[320px] mx-auto">
            {description}
          </p>
        )}

        {selected && (
          <span className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
            ✓ Active
          </span>
        )}

        {/* Subtle shimmer on hover */}
        <div
          className="absolute top-0 left-[-40%] h-full w-1/2 opacity-0 group-hover:opacity-15 transition-opacity duration-300"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.9) 50%, transparent 100%)',
            transform: 'skewX(-15deg)',
          }}
        />
      </div>

      {/* Body */}
      <div className="px-6 pt-6 pb-7">
        <h6 className="text-slate-900 font-semibold mb-4 text-center text-[18px] leading-tight">
          What's Included
        </h6>

        <ul className="space-y-3 max-h-[210px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-1">
          {featureItems
            ? featureItems.map((f, i) => {
                if (f.type === 'boolean') {
                  return (
                    <li key={i} className="flex items-center text-slate-700 text-[14px]">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                        style={{ backgroundColor: f.value ? accent : danger }}
                      >
                        {f.value ? (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 8.586L4.293 2.879 2.879 4.293 8.586 10l-5.707 5.707 1.414 1.414L10 11.414l5.707 5.707 1.414-1.414L11.414 10l5.707-5.707-1.414-1.414L10 8.586z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className="break-words">{f.label}</span>
                    </li>
                  );
                }
                if (f.type === 'number') {
                  return (
                    <li key={i} className="flex items-center text-slate-700 text-[14px]">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-white text-xs font-bold"
                        style={{ backgroundColor: primaryLight }}
                      >
                        {f.value}
                      </div>
                      <span className="break-words">{f.label}</span>
                    </li>
                  );
                }
                return null;
              })
            : Array.isArray(data?.description) &&
              data.description.map((a, i) => (
                <li key={i} className="flex items-center text-slate-700 text-[14px]">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                    style={{ backgroundColor: primaryLight }}
                  >
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="break-words">{a}</span>
                </li>
              ))}
        </ul>

        {/* CTA */}
        <div className="mt-6">
          {selected ? (
            <Button
              disabled
              onClick={() => null}
              variant="secondary"
              className="w-full bg-white border border-green-500 text-green-700 font-semibold py-3 px-6 rounded-lg"
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
                transition-all duration-200
                text-white border-0 shadow-sm
                ${loading ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-md hover:translate-y-[-1px]'}
              `}
              style={{ background: `linear-gradient(90deg, ${primary} 0%, ${primaryLight} 100%)` }}
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
                    Buy Now
                  </>
                )}
              </div>
            </Button>
          )}
        </div>
      </div>

      {/* Bottom decorative wave */}
      <div
        className="absolute left-0 right-0 bottom-0 h-10 rounded-b-[28px]"
        style={{
          background: selected
            ? 'linear-gradient(180deg, rgba(16,185,129,0.15), rgba(16,185,129,0.25))'
            : 'linear-gradient(180deg, rgba(2,55,137,0.05), rgba(2,55,137,0.12))',
        }}
      />
    </div>
  );
}
