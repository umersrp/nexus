import { Switch } from 'antd';
import Style from './Header.module.css';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '@/store/commonReducer/commonSlice';

const Header = ({ className, heading = '' }) => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.commonReducer);

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
    <div className={[Style.navbarContainer, className].join(' ')}>
      <div className={Style?.headingContainer}>
        <span>{heading}</span>
        <Switch
          checkedChildren='dark'
          unCheckedChildren='light'
          checked={theme == 'dark'} // value={theme}
          className='mode-switcher'
          onChange={(e) => {
            document.body.classList.remove(!e ? 'dark' : 'light');
            document.body.classList.add(e ? 'dark' : 'light');
            dispatch(setTheme(e ? 'dark' : 'light'));
          }}
        ></Switch>
      </div>
    </div>
  );
};

export default Header;
