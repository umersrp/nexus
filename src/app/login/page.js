'use client';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CustomToast } from '@/CustomToast';
import { encryptToken } from '@/config/helper';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { Post } from '../../Axios/AxiosFunctions';
import { apiHeader, BaseURL, validateEmail } from '../../config/apiUrl';
import { saveLoginUserData } from '../../store/auth/authSlice';
import classes from './Login.module.css';

const Login = () => {
  const router = useRouter();
  const cookies = Cookies;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const headers = apiHeader();

  const handleLogin = async () => {
    const params = {
      email,
      password,
    };

    for (let key in params) {
      if (!params[key]) {
        return CustomToast({
          message: `Please fill the ${key} field!`,
          type: 'error',
        });
      }
    }
    if (!validateEmail(email)) {
      return CustomToast({
        message: 'Please enter a valid email',
        type: 'error',
      });
    }
    if (password?.length < 8) {
      return CustomToast({
        message: 'Password must be 8 characters or greater',
        type: 'error',
      });
    }
    const url = BaseURL('auth/login');
    console.log('Login request:', { url, params, headers });
    setLoading(true);
    try {
      const response = await Post(url, params, headers);
      setLoading(false);

      if (response !== undefined) {
        dispatch(saveLoginUserData(response?.data?.data));
        cookies.set('xpdx', encryptToken(response?.data?.data?.token), {
          expires: 90,
        });
        cookies.set('role', response?.data?.data?.user?.role, {
          expires: 90,
        });
        toast.success('Logged In successfully');
        if (['admin', 'super_admin'].includes(response?.data?.data?.user?.role)) {
          router.replace('/admin/dashboard');
        } else {
          router.push(
            response?.data?.data?.user?.isProfileComplete
              ? response?.data?.data?.user?.isSession
                ? '/sessions'
                : '/dashboard'
              : '/my-profile'
          );
        }
      }
    } catch (error) {
      setLoading(false);
      console.error('Login error:', error);
      CustomToast({
        message: error?.response?.data?.message || 'Login failed. Please check your credentials.',
        type: 'error',
      });
    }
  };
  return (
    <div
      className={[classes.mainContainer, 'bg-white'].join(' ')}
    >
      <div className='tailwind-container '>
        <div className={[classes.innerContainer].join(' ')}>
          <div className='grid-rows-1'>
            <div md={12}>
              <div className={classes.imgDiv}>
                <img src={'/image.png'} alt='Nexus' />
              </div>
              <h4 className='text-center text-white'>Login</h4>
            </div>
            <div md={12}>
              <div className={[classes.col]}>
                <Input
                  placeholder='Enter email'
                  type='email'
                  value={email}
                  setter={setEmail}
                  label={'Email'}
                />
              </div>
              <div className={[classes.col]}>
                <Input
                  placeholder='Enter password'
                  value={password}
                  setter={setPassword}
                  type='password'
                  label={'Password'}
                />
              </div>

              <Button
                className={classes.loginBtn}
                label={loading ? 'SUBMITTING...' : 'LOGIN'}
                onClick={handleLogin}
                disabled={loading}
              />
            </div>
            <div md={12}>
              <p className={classes?.signupText}>
                {"Don't have an account?"} <Link href={'/signup'}>Sign Up</Link>
              </p>
              <p className={classes?.signupText}>
                <Link href={'/forgot-password'}>Forgot password?</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
