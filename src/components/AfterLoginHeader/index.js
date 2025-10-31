'use client';
import Cookies from 'js-cookie';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { signOutRequest } from '../../store/auth/authSlice';
import Style from './afterloginheader.module.css';

import { setIsOpenSidebar, setTheme } from '@/store/commonReducer/commonSlice';
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

  const HandleSubmitSignOut = () => {
    Cookies.remove('xpdx');
    Cookies.remove('role');
    dispatch(signOutRequest());

    navigate.push('/');
  };

  useEffect(() => {
    // Force light theme on mount
    document.body.classList.remove('dark');
    document.body.classList.add('light');
    dispatch(setTheme('light'));
  }, [dispatch]);

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
          </div>
        </div>
      </div>
    </Suspense>
  );
}
