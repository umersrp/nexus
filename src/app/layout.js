import { Poppins } from 'next/font/google';
import 'react-modern-drawer/dist/index.css';
import 'react-toastify/dist/ReactToastify.min.css';
import './globals.css';
import './table.css';
import 'antd/dist/antd.min.js';
import 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--archivo',
  weight: ['400', '500', '600', '700'],
});

export const metadata = {
  title: 'Project',
  description: 'Project',
};

export default function RootLayout({ children, ...rest }) {
  return (
    <html lang='en'>
      <body className={poppins.variable}>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}
