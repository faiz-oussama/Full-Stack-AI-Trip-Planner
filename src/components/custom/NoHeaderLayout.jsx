import { Outlet } from 'react-router-dom';

export default function NoHeaderLayout({ children }) {
  return (
    <main className="min-h-screen">
      {children || <Outlet />}
    </main>
  );
}