import { Poppins } from 'next/font/google';
import './globals.css';
import './table.css';
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

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={poppins.variable}>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}