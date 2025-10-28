'use client';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { useState } from 'react';
import Cookies from 'js-cookie';
import { Post } from '@/Axios/AxiosFunctions';
import { apiHeader, BaseURL } from '@/config/apiUrl';
import { CustomToast } from '@/CustomToast';
import classes from '../forgot-password/ForgotPassword.module.css';

const ChangePasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const token = Cookies.get('xpdx');
  const headers = apiHeader(token);

  const onSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return CustomToast({ message: 'All fields are required', type: 'error' });
    }
    if (newPassword.length < 8 || confirmPassword.length < 8) {
      return CustomToast({ message: 'Minimum 8 characters', type: 'error' });
    }
    if (newPassword !== confirmPassword) {
      return CustomToast({ message: 'Passwords do not match', type: 'error' });
    }
    const url = BaseURL('auth/change-password');
    setLoading(true);
    try {
      const res = await Post(url, { currentPassword, newPassword, confirmPassword }, headers);
      setLoading(false);
      if (res !== undefined) {
        CustomToast({ message: 'Password changed successfully', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      setLoading(false);
      console.error('Change password error:', error);
      CustomToast({
        message: error?.response?.data?.message || 'Failed to change password. Please try again.',
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
              <h4 className='text-center text-white'>Change Password</h4>
            </div>
            <div md={12}>
              <div className={[classes.col]}>
                <Input
                  placeholder='Enter current password'
                  type='password'
                  value={currentPassword}
                  setter={setCurrentPassword}
                  label={'Current Password'}
                />
              </div>
              <div className={[classes.col]}>
                <Input
                  placeholder='Enter new password'
                  type='password'
                  value={newPassword}
                  setter={setNewPassword}
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
                label={loading ? 'UPDATING...' : 'UPDATE PASSWORD'}
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

export default ChangePasswordPage;


