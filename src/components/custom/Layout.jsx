import { Outlet } from 'react-router-dom';
import Header from "../custom/Header";

export default function Layout({ children }) {
  return (
    <>
      <Header />
        {children}
      <Outlet />
    </>
  );
}