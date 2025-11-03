import SideBarSkeleton from '@/components/SideBarSkeleton';

export default function AdminLayout({ children }) {
  return (
    <SideBarSkeleton>
      {children}
    </SideBarSkeleton>
  );
}
