'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Post } from '@/Axios/AxiosFunctions';
import { apiHeader, BaseURL } from '@/config/apiUrl';
import { CustomToast } from '@/CustomToast';
import classes from '../forgot-password/ForgotPassword.module.css';

const VerifyEmailPage = () => {
  const params = useParams();
  const router = useRouter();
  const token = params?.token;

  const [loading, setLoading] = useState(true);
  const headers = apiHeader();

  useEffect(() => {
    const run = async () => {
      const url = BaseURL(`auth/verify-email/${token}`);
      const res = await Post(url, {}, headers);
      setLoading(false);
      if (res !== undefined) {
        CustomToast({ message: 'Email verified successfully', type: 'success' });
        router.replace('/login');
      }
    };
    if (token) run();
  }, [token]);

  return (
    <div className={[classes.mainContainer, 'bg-[var(--page-bg-color)]'].join(' ')}>
      <div className='tailwind-container'>
        <div className={[classes.innerContainer]}>
          <div className='grid-rows-1'>
            <div md={12}>
              <h4 className='text-center text-white'>Verify Email</h4>
            </div>
            <div md={12}>
              <p className='text-center text-white/80'>
                {loading ? 'Verifying your email...' : 'Email verification completed!'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;


