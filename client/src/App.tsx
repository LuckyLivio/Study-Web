import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';

// 懒加载页面组件以减少初始包大小
const HomePage = React.lazy(() => import('./pages/HomePage'));
const StudyPage = React.lazy(() => import('./pages/StudyPage'));
const PortfolioPage = React.lazy(() => import('./pages/PortfolioPage'));
const BlogPage = React.lazy(() => import('./pages/BlogPage'));
const SchedulePage = React.lazy(() => import('./pages/SchedulePage'));
const MessagePage = React.lazy(() => import('./pages/MessagePage'));
const LinksPage = React.lazy(() => import('./pages/LinksPage'));
const Tools = React.lazy(() => import('./pages/Tools'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Profile = React.lazy(() => import('./pages/Profile'));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
          }>
            <Routes>
            {/* 公开路由 */}
            <Route path="/" element={<HomePage />} />
            
            {/* 认证路由 */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* 需要登录的路由 */}
            <Route 
              path="/study" 
              element={
                <ProtectedRoute>
                  <StudyPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/portfolio" 
              element={
                <ProtectedRoute>
                  <PortfolioPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/blog" 
              element={
                <ProtectedRoute>
                  <BlogPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/schedule" 
              element={
                <ProtectedRoute>
                  <SchedulePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <MessagePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/links" 
              element={
                <ProtectedRoute>
                  <LinksPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tools" 
              element={
                <ProtectedRoute>
                  <Tools />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
            {/* 管理员路由 */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
