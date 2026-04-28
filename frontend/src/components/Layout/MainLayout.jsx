import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import '../styles/MainLayout.css';

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div className="sc-main-layout">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="sc-layout-container">
        <Sidebar isOpen={sidebarOpen} />
        <main className="sc-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
