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

const { Header, Sider, Content, Footer } = Layout;
export default function MainLayout({ children, time }) {
  const { isOpenSidebar } = useSelector((state) => state.commonReducer);
  const router = useRouter();
  const dispatch = useDispatch();
  const pathname = usePathname();
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
          <span>Nexus</span> <span className='text-xl block'>AI Space</span>
        </h4>

        <Menu
          theme='dark'
          mode='inline'
          selectedKeys={[
            (pathname == '/dashboard' && '0') ||
              (pathname == '/sessions' && '1') ||
              (pathname == '/my-profile' && '2') ||
              (pathname == '/plans' && '3'),
          ]}
          className='!mt-[40px] !bg-inherit'
        >
          <Menu.Item
            key='0'
            onClick={() => {}}
            icon={<MdDashboard size={20} />}
          >
            <Link href={'/dashboard'}>
              <span>Dashboard</span>
            </Link>
          </Menu.Item>
          <Menu.Item key='1' icon={<FaBookOpen size={20} />}>
            <Link href={'/sessions'}>
              <span>Sessions</span>
            </Link>
          </Menu.Item>

          <Menu.Item key='2' icon={<MdManageAccounts size={25} />}>
            <Link href={'/my-profile'}>
              <span>My Profile</span>
            </Link>
          </Menu.Item>
          <Menu.Item key='3' icon={<PiPackageBold size={25} />}>
            <Link href={'/plans'}>
              <span>Plans</span>
            </Link>
          </Menu.Item>
          <Menu.Item
            key='4'
            icon={<MdLogout size={20} />}
            onClick={() => {
              dispatch(signOutRequest());
              dispatch(setSessionData(null));
              dispatch(setIsSessionOpen(false));
              router?.replace('/login');
            }}
          >
            <span>Logout</span>
          </Menu.Item>
        </Menu>
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
