import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { RightSidebar } from './RightSidebar';

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);

  // Pages où le RightSidebar ne doit pas apparaître
  const hideRightSidebarRoutes = ['/settings'];
  const shouldHideRightSidebar = hideRightSidebarRoutes.includes(location.pathname);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Overlay mobile sidebar gauche */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Overlay mobile sidebar droite */}
      {rightSidebarOpen && !shouldHideRightSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setRightSidebarOpen(false)}
        />
      )}

      {/* Sidebar gauche */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar 
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onRightSidebarClick={() => {
            if (!shouldHideRightSidebar) {
              if (window.innerWidth >= 1024) {
                setRightSidebarCollapsed(!rightSidebarCollapsed);
              } else {
                setRightSidebarOpen(!rightSidebarOpen);
              }
            }
          }}
          rightSidebarCollapsed={rightSidebarCollapsed}
        />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Sidebar droite - Masquée sur certaines pages */}
      {!shouldHideRightSidebar && !rightSidebarCollapsed && (
        <div className={`
          fixed lg:static inset-y-0 right-0 z-50
          transform transition-transform duration-300 ease-in-out
          ${rightSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          <RightSidebar 
            isCollapsed={rightSidebarCollapsed}
            onToggle={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
            onClose={() => setRightSidebarOpen(false)}
          />
        </div>
      )}
    </div>
  );
}