'use client';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { apiHeader, BaseURL } from '@/config/apiUrl';
import { CustomToast } from '@/CustomToast';
import { Checkbox, Col, Row } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import validator from 'validator';
import { Post } from '../../Axios/AxiosFunctions';
import classes from './Signup.module.css';

const Signup = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  const [terms, setTerms] = useState('');

  const dispatch = useDispatch();
  const headers = apiHeader();

  const handleSignup = async () => {
    const params = {
      firstName,
      lastName,
      email,
      password,
      confirmPassword: confirmPassword,
    };
    for (let key in params) {
      if (!params[key]) {
        return CustomToast({
          message: 'Please fill all the required fields!',
          type: 'error',
        });
      }
    }
    if (!validator.isEmail(params?.email)) {
      return CustomToast({
        message: 'Please enter a valid email',
        type: 'error',
      });
    }
    if (
      !validator.isStrongPassword(params?.password, {
        minLength: 8,
        minNumbers: 0,
        minLowercase: 0,
        minSymbols: 0,
        minUppercase: 0,
      })
    ) {
      return CustomToast({
        message: 'Password must be 8 characters or greater',
        type: 'error',
      });
    }
    if (
      !validator.isStrongPassword(params?.confirmPassword, {
        minLength: 8,
        minNumbers: 0,
        minLowercase: 0,
        minSymbols: 0,
        minUppercase: 0,
      })
    ) {
      return CustomToast({
        message: 'Confirm Password must be 8 characters or greater',
        type: 'error',
      });
    }
    if (password !== confirmPassword) {
      return CustomToast({
        message: 'Passwords does not match',
        type: 'error',
      });
    }
    if (!terms) {
      return CustomToast({
        message: 'Please accept terms and conditions',
        type: 'error',
      });
    }

    const url = BaseURL('auth/register');
    setLoading(true);
    try {
      const response = await Post(url, params, headers);
      setLoading(false);

      if (response !== undefined) {
        console.log('Registration response:', response);
        return CustomToast({
          message:
            'Congrats! You have successfully signed up, Please check your email to verify your account',
          type: 'success',
        });
      }
    } catch (error) {
      setLoading(false);
      console.error('Registration error:', error);
      CustomToast({
        message: error?.response?.data?.message || 'Registration failed. Please try again.',
        type: 'error',
      });
    }
  };
  return (
    <div
      className={[classes.mainContainer, 'bg-[var(--page-bg-color)]'].join(' ')}
    >
      <div className='tailwind-container '>
        <div className={[classes.innerContainer]}>
          <Row gutter={[30, 16]}>
            <Col xs={24}>
              <h4 className='text-center text-white'>Sign Up</h4>
            </Col>
            <Col md={12} xs={24}>
              <Input
                placeholder='Enter first name'
                value={firstName}
                setter={setFirstName}
                label={'First Name'}
              />
            </Col>
            <Col md={12} xs={24}>
              <Input
                placeholder='Enter last name'
                value={lastName}
                setter={setLastName}
                label={'Last Name'}
              />
            </Col>
            <Col xs={24}>
              <Input
                placeholder='Enter email'
                type='email'
                value={email}
                setter={setEmail}
                label={'Email'}
              />
            </Col>
            <Col xs={24}>
              <Input
                placeholder='Enter password'
                value={password}
                setter={setPassword}
                type='password'
                label={'Password'}
              />
            </Col>
            <Col xs={24}>
              <Input
                placeholder='Enter confirm password'
                value={confirmPassword}
                setter={setConfirmPassword}
                type='password'
                label={'Confirm Password'}
              />
            </Col>
            <Col xs={24}>
              <div className='flex items-center gap-x-3'>
                <Checkbox
                  checked={terms}
                  onChange={() => setTerms((prev) => !prev)}
                  label={'Terms'}
                />
                <label className='text-white mb-0'>Terms and Conditions</label>
              </div>
            </Col>
            <Col xs={24}>
              <Button
                className={classes.loginBtn}
                label={loading ? 'SUBMITTING...' : 'SIGN UP'}
                onClick={handleSignup}
                disabled={loading}
              />
            </Col>
            <Col xs={24}>
              <p className={classes?.loginText}>
                Already have an account? <Link href={'/login'}>Login</Link>
              </p>
              <p className={classes?.loginText}>
                <Link href={'/resend-verification'}>Resend verification email</Link>
              </p>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default Signup;
