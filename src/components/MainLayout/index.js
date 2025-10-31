'use client';
import { signOutRequest } from '@/store/auth/authSlice';
import {
  setIsOpenSidebar,
  setIsSessionOpen,
  setSessionData,
} from '@/store/commonReducer/commonSlice';
import { Layout, Menu } from 'antd';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaBookOpen } from 'react-icons/fa';
import { MdDashboard, MdLogout, MdManageAccounts } from 'react-icons/md';
import { PiPackageBold } from 'react-icons/pi';
import { useDispatch, useSelector } from 'react-redux';
import AfterLoginHeader from '../AfterLoginHeader';
import Image from 'next/image';

const { Header, Sider, Content, Footer } = Layout;
export default function MainLayout({ children, time }) {
  const { isOpenSidebar } = useSelector((state) => state.commonReducer);
  const router = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();
  const userMenuItems = [
    {
      key: '/dashboard',
      icon: <MdDashboard size={18} />,
      label: 'Dashboard',
    },
    {
      key: '/my-profile',
      icon: <MdManageAccounts size={18} />,
      label: 'My Profile',
    },
    {
      key: '/sessions',
      icon: <FaBookOpen size={16} />,
      label: 'Sessions',
    },
    {
      key: '/my-orders',
      icon: <FaBookOpen size={16} />,
      label: 'My Orders',
    },
    {
      key: '/my-subscription',
      icon: <PiPackageBold size={18} />,
      label: 'My Subscription',
    },
    {
      key: '/plans',
      icon: <PiPackageBold size={18} />,
      label: 'Plans',
    },
    {
      type: 'divider',
    },
    {
      key: '__logout__',
      icon: <MdLogout size={18} />,
      label: 'Logout',
    },
  ];
  return (
    <Layout className=''>
      <Sider
        collapsed={isOpenSidebar}
        onCollapse={() => dispatch(setIsOpenSidebar())}
        breakpoint='lg'
        collapsedWidth='0'
        trigger={null}
        className='!bg-[#023789]'
      >
        <h4 className='text-white text-center mt-4'>
        <Image src={'/image.png'} alt={'Nexus'} width={120} height={36} priority />
        </h4>
        <div className='mt-4'>
          <Menu
            theme='dark'
            mode='inline'
            className='!bg-[#023789]'
            selectedKeys={[pathname]}
            items={userMenuItems}
            onClick={(info) => {
              if (info?.key === '__logout__') {
                dispatch(signOutRequest());
                router.replace('/login');
                return;
              }
              if (info?.key && info?.key !== pathname) {
                router.push(info.key);
              }
            }}
          />
        </div>
      </Sider>
      <Layout
        className='
        h-screen
        overflow-y-auto
      
               dark:!bg-[var(--page-bg-color)]
      '
      >
        <AfterLoginHeader
          containerClass={'tailwind-container'}
          type={'dashboard'}
          time={time}
        />

        <Content className='h-full'>
          <div className='xxl:mb-5 xxl:mt-5 xl:mb-5 xl:mt-5 lg:mb-4 lg:mt-6 md:my-3 my-2 px-6  pb-6'>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
