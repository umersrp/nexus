'use client';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Link from 'next/link';
import { useState } from 'react';
import { Post } from '@/Axios/AxiosFunctions';
import { apiHeader, BaseURL, validateEmail } from '@/config/apiUrl';
import { CustomToast } from '@/CustomToast';
import classes from './ForgotPassword.module.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const headers = apiHeader();

  const onSubmit = async () => {
    if (!email) {
      return CustomToast({ message: 'Email is required', type: 'error' });
    }
    if (!validateEmail(email)) {
      return CustomToast({ message: 'Enter a valid email', type: 'error' });
    }
    const url = BaseURL('auth/forgot-password');
    setLoading(true);
    try {
      const res = await Post(url, { email }, headers);
      setLoading(false);
      if (res !== undefined) {
        console.log('Forgot password response:', res);
        CustomToast({
          message: 'If the email exists, a reset link has been sent.',
          type: 'success',
        });
      }
    } catch (error) {
      setLoading(false);
      console.error('Forgot password error:', error);
      CustomToast({
        message: error?.response?.data?.message || 'Failed to send reset email. Please try again.',
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
              <h4 className='text-center text-white'>Forgot Password</h4>
            </div>
            <div md={12}>
              <div className={[classes.col]}>
                <Input
                  placeholder='Enter your email'
                  type='email'
                  value={email}
                  setter={setEmail}
                  label={'Email'}
                />
              </div>

              <Button
                className={classes.submitBtn}
                label={loading ? 'SENDING...' : 'SEND RESET LINK'}
                onClick={onSubmit}
                disabled={loading}
              />
            </div>
            <div md={12}>
              <p className={classes?.linkText}>
                <Link href={'/login'}>Back to Login</Link>
              </p>
              <p className={classes?.linkText}>
                <Link href={'/signup'}>Don't have an account? Sign Up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;


