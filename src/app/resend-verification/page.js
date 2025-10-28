'use client';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { useState } from 'react';
import { Post } from '@/Axios/AxiosFunctions';
import { apiHeader, BaseURL } from '@/config/apiUrl';
import { CustomToast } from '@/CustomToast';
import classes from '../forgot-password/ForgotPassword.module.css';

const ResendVerificationPage = () => {
  const [refreshToken, setRefreshToken] = useState('');
  const [loading, setLoading] = useState(false);
  const headers = apiHeader();

  const onSubmit = async () => {
    if (!refreshToken) {
      return CustomToast({ message: 'Refresh token is required', type: 'error' });
    }
    const url = BaseURL('auth/resend-verification');
    setLoading(true);
    try {
      const res = await Post(url, { refreshToken }, headers);
      setLoading(false);
      if (res !== undefined) {
        CustomToast({ message: 'Verification email sent', type: 'success' });
        setRefreshToken('');
      }
    } catch (error) {
      setLoading(false);
      console.error('Resend verification error:', error);
      CustomToast({
        message: error?.response?.data?.message || 'Failed to send verification email. Please try again.',
        type: 'error',
      });
    }
  };

  return (
    <div className={[classes.mainContainer, 'bg-[var(--page-bg-color)]'].join(' ')}>
      <div className='tailwind-container'>
        <div className={[classes.innerContainer]}>
          <div className='grid-rows-1'>
            <div md={12}>
              <h4 className='text-center text-white'>Resend Verification</h4>
            </div>
            <div md={12}>
              <div className={[classes.col]}>
                <Input
                  placeholder='Enter refresh token'
                  type='text'
                  value={refreshToken}
                  setter={setRefreshToken}
                  label={'Refresh Token'}
                />
              </div>

              <Button
                className={classes.submitBtn}
                label={loading ? 'SENDING...' : 'SEND VERIFICATION EMAIL'}
                onClick={onSubmit}
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResendVerificationPage;


