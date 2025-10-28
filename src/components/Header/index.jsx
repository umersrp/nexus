// Dark mode removed; keep header minimal
import Style from './Header.module.css';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '@/store/commonReducer/commonSlice';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { AiOutlineLogout } from 'react-icons/ai';
import { FiBell } from 'react-icons/fi';

const Header = ({ className, heading = '' }) => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.commonReducer);

  useEffect(() => {
    document.body.classList.remove('dark');
    document.body.classList.add('light');
    dispatch(setTheme('light'));
  }, []);
  const router = useRouter();

  const handleLogout = () => {
    try {
      Cookies.remove('xpdx');
      Cookies.remove('role');
    } catch (e) {}
    router.replace('/login');
  };

  return (
    <div className={[Style.navbarContainer, className].join(' ')}>
      <div className={Style?.headingContainer}>
        <div />
        <div className={Style.rightContainer}>
          <button
            type='button'
            aria-label='Notifications'
            className='p-2 rounded-full hover:bg-gray-100 transition-colors'
            title='Notifications'
          >
            <FiBell size={20} />
          </button>
          <button
            type='button'
            aria-label='Logout'
            className='p-2 ml-2 rounded-full hover:bg-gray-100 transition-colors'
            onClick={handleLogout}
            title='Logout'
          >
            <AiOutlineLogout size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
