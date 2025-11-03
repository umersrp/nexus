'use client';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Post } from '@/Axios/AxiosFunctions';
import { apiHeader, BaseURL } from '@/config/apiUrl';
import { CustomToast } from '@/CustomToast';
import classes  from '../../forgot-password/forgotPassword.module.css';

const ResetPasswordPage = () => {
  const params = useParams();
  const router = useRouter();
  const token = params?.token;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const headers = apiHeader();

  const onSubmit = async () => {
    if (!password || !confirmPassword) {
      return CustomToast({ message: 'All fields are required', type: 'error' });
    }
    if (password.length < 8 || confirmPassword.length < 8) {
      return CustomToast({ message: 'Minimum 8 characters', type: 'error' });
    }
    if (password !== confirmPassword) {
      return CustomToast({ message: 'Passwords do not match', type: 'error' });
    }
    const url = BaseURL(`auth/reset-password/${token}`);
    setLoading(true);
    try {
      const res = await Post(url, { password, confirmPassword }, headers);
      setLoading(false);
      if (res !== undefined) {
        CustomToast({ message: 'Password reset successful', type: 'success' });
        router.replace('/login');
      }
    } catch (error) {
      setLoading(false);
      console.error('Reset password error:', error);
      CustomToast({
        message: error?.response?.data?.message || 'Failed to reset password. Please try again.',
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
              <h4 className='text-center text-white'>Reset Password</h4>
            </div>
            <div md={12}>
              <div className={[classes.col]}>
                <Input
                  placeholder='Enter new password'
                  type='password'
                  value={password}
                  setter={setPassword}
                  label={'New Password'}
                />
              </div>
              <div className={[classes.col]}>
                <Input
                  placeholder='Confirm new password'
                  type='password'
                  value={confirmPassword}
                  setter={setConfirmPassword}
                  label={'Confirm Password'}
                />
              </div>

              <Button
                className={classes.submitBtn}
                label={loading ? 'RESETTING...' : 'RESET PASSWORD'}
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

export default ResetPasswordPage;


