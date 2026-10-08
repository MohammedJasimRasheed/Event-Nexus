import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Sidebar from './components/layout/Sidebar'
import Footer from './components/layout/Footer'
import MobileDrawer from './components/layout/MobileDrawer'
import MobileBottomNav from './components/layout/MobileBottomNav'
import Home from './pages/Home'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import CreateEvent from './pages/CreateEvent'
import Favorites from './pages/Favorites'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import Notifications from './pages/Notifications'
import Hackathons from './pages/Hackathons'
import Competitions from './pages/Competitions'
import Courses from './pages/Courses'
import FreeResources from './pages/FreeResources'
import CollegeEvents from './pages/CollegeEvents'
import Colleges from './pages/Colleges'
import PrivateRoute from './components/auth/PrivateRoute'
import { useLenis } from './hooks/useLenis'

import { ThemeProvider } from './context/ThemeContext'
import BackgroundParticles from './components/common/BackgroundParticles'

function App() {
  useLenis();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const location = useLocation();
  const hideSidebarRoutes = ['/login', '/register'];
  const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className={`min-h-screen flex flex-col relative overflow-hidden ${!shouldHideSidebar ? 'pt-16' : ''}`}>
        <BackgroundParticles />

        {!shouldHideSidebar && (
          <Navbar
            isCollapsed={isCollapsed}
            isDrawerOpen={isDrawerOpen}
            onMenuClick={() => setIsDrawerOpen(!isDrawerOpen)}
          />
        )}

        {!shouldHideSidebar && (
          <MobileDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
          />
        )}

        <div className="flex flex-1">
          {!shouldHideSidebar && <div className="hidden md:block">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
          </div>}
          <main className={`flex-grow flex flex-col ${shouldHideSidebar ? 'w-full' : 'w-0'} z-10`}>
            <div className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/colleges" element={<Colleges />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetail />} />
                <Route path="/colleges/:id/events" element={<CollegeEvents />} />
                <Route path="/hackathons" element={<Hackathons />} />
                <Route path="/competitions" element={<Competitions />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/free-resources" element={<FreeResources />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/register" element={<Auth />} />
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } />
                <Route path="/create-event" element={
                  <PrivateRoute>
                    <CreateEvent />
                  </PrivateRoute>
                } />
                <Route path="/favorites" element={
                  <PrivateRoute>
                    <Favorites />
                  </PrivateRoute>
                } />
                <Route path="/profile" element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } />
                <Route path="/admin" element={
                  <PrivateRoute>
                    <Admin />
                  </PrivateRoute>
                } />
                <Route path="/notifications" element={
                  <PrivateRoute>
                    <Notifications />
                  </PrivateRoute>
                } />
              </Routes>
            </div>
            {!shouldHideSidebar && location.pathname === '/' && <Footer />}
          </main>
        </div>
        {!shouldHideSidebar && location.pathname === '/' && <MobileBottomNav />}
      </div>
    </ThemeProvider>
  );
}

export default App
