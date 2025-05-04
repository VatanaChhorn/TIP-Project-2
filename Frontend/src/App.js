import logo from './logo.svg';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';

/* Auth */
import LoginPage from './app/auth/LoginPage';
import SignupPage from './app/auth/SignupPage';
import Navbar from './app/Navbar';

/* End-User */
import LandingPage from './app/end-user/LandingPage';
import DetectionResultPage from './app/end-user/DetectionResultPage';
import UserScanHistory from './app/end-user/UserScanHistory';

/* Admin-User */
import UserDashboard from './app/admin-user/UserDashboard';
import AdminDashboard from './app/admin-user/AdminDashboard';
import AdminAnalyticsDashboard from './app/admin-user/AdminAnalyticsDashboard';

import ProfilePage from './app/ProfilePage';


function App() {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '64px' }}> {/* Add padding to account for fixed navbar */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<SignupPage />} />

      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/scan-history" element={<UserScanHistory />} />
      <Route path="/detection-result" element={<DetectionResultPage />} />


      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/analytics" element={<AdminAnalyticsDashboard />} />

      <Route path="/profile" element={<ProfilePage />} />
      {/* Redirect any unknown routes to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
