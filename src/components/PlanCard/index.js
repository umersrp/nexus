import { useState } from 'react';
import Button from '../Button';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

export default function PlanCard({ data, onPurchase = () => {}, selected }) {
  const router = useRouter();
  const { user } = useSelector((state) => state?.authReducer);
  const [loading, setLoading] = useState(false);
  return (
    <div
      className={`border-[1px] border-[var(--primary-color)] rounded-lg mb-2   `}
    >
      <div className='h-[100px]  bg-[var(--primary-color)] rounded-t-[inherit] flex justify-center items-center flex-col'>
        <h5 className='text-white'>{data?.name}</h5>
        <h6 className='text-white'>
          €{data?.price}
          {/* / {data?.duration}Mins */}
        </h6>
      </div>
      <div className={`${selected && 'bg-[#1ac4e13b] text-white'} py-3`}>
        <ul className=' mb-4 plan-scroll h-[150px] text-black dark:text-white px-[20px] list-disc ml-3'>
          {data?.description?.map((a, i) => {
            return (
              <li key={i} className='mb-[3px]'>
                {a}
              </li>
            );
          })}
        </ul>
        <div className='flex justify-center items-center '>
          {!user?.isProfileComplete ? (
            <Button onClick={() => router?.push('/my-profile')}>
              Complete Profile
            </Button>
          ) : selected ? (
            <Button disabled onClick={() => null} variant='secondary'>
              Current Plan
            </Button>
          ) : (
            <Button
              onClick={async () => {
                setLoading(true);
                await onPurchase();
                setLoading(false);
              }}
              disabled={loading}
            >
              {loading ? 'Wait...' : `Purchase`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
