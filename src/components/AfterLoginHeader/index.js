'use client';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { signOutRequest } from '../../store/auth/authSlice';
import Style from './afterloginheader.module.css';

import { setIsOpenSidebar, setTheme } from '@/store/commonReducer/commonSlice';
import { Switch } from 'antd';
import { FaBars } from 'react-icons/fa';

export default function AfterLoginHeader({
  containerClass,
  className,
  type = 'web',
  time,
}) {
  const dispatch = useDispatch();
  const { user: userData } = useSelector((state) => state?.authReducer);

  const navigate = useRouter();
  const { theme } = useSelector((state) => state.commonReducer);

  const HandleSubmitSignOut = () => {
    Cookies.remove('xpdx');
    Cookies.remove('role');
    dispatch(signOutRequest());

    navigate.push('/');
  };

  const items = [
    {
      label: <Link href={'/my-profile'}>My Profile</Link>,
      key: '0',
    },
    {
      type: 'divider',
    },
    {
      label: <div>Logout</div>,
      key: '3',
    },
  ];

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark')?.matches) {
      document.body.classList.add('dark');
      dispatch(setTheme('dark'));
    } else if (theme) {
      document.body.classList.add(theme);
    } else if (window.matchMedia('(prefers-color-scheme: dark')?.matches) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.add('dark');
    }
  }, []);

  return (
    <Suspense>
      {' '}
      <div
        collapseOnSelect
        expand='lg'
        className={`${[Style.header, className].join(' ')}`}
        style={{ backgroundColor: '#023789' }}
        data-type={type}
      >
        <div className={`${[Style.navbarContainer, containerClass].join(' ')}`}>
          {type !== 'dashboard' ? (
            <h5 className={'text-white'}>
              <span>Nexus</span> <span className='text-xl block'>AI Space</span>
            </h5>
          ) : (
            <button
              onClick={() => {
                dispatch(setIsOpenSidebar());
              }}
            >
              <FaBars className='text-white text-[20px]' />
            </button>
          )}

          <div className={time ? 'flex items-center gap-x-2' : ''}>
            {time && (
              <p className='text-white mb-0 text-[18px] text-semibold'>
                Time Left:
                <b className='text-[20px] text-bold ps-2'>{time}</b>
              </p>
            )}
            <Switch
              checkedChildren='dark'
              unCheckedChildren='light'
              checked={theme == 'dark'} // value={theme}
              onChange={(e) => {
                document.body.classList.remove(!e ? 'dark' : 'light');
                document.body.classList.add(e ? 'dark' : 'light');
                dispatch(setTheme(e ? 'dark' : 'light'));
              }}
            ></Switch>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
