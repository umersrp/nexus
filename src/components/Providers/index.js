'use client';
import store, { persistor } from '@/store';
import Cookie from 'js-cookie';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PersistGate } from 'redux-persist/lib/integration/react';

import AfterLoginHeader from '../AfterLoginHeader';

export function Providers({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const showHeader = ['/login', '/signup'].includes(pathname);

  useEffect(() => {
    const PackageJson = require('../../../package.json');
    const localVersion = localStorage.getItem('version');

    if (PackageJson.version !== localVersion) {
      localStorage.clear();
      Cookie.remove('role');
      Cookie.remove('xpdx');
      localStorage.setItem('version', PackageJson.version);
      window.location.reload();
    }
  }, []);

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={null}>
        <>
          {showHeader ? (
            <AfterLoginHeader containerClass={'tailwind-container'} />
          ) : null}
          {children} <ToastContainer />
        </>
      </PersistGate>
    </Provider>
  );
}
