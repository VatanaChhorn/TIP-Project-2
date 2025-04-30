import logo from './logo.svg';
import './App.css';
import LoginPage from './app/auth/LoginPage';
import SignupPage from './app/auth/SignupPage';


import LandingPage from './app/end-user/LandingPage';
import DetectionResultPage from './app/end-user/DetectionResultPage';
import UserDashboard from './app/end-user/UserDashboard';

import AdminDashboard from './app/admin-user/AdminDashboard';
import AdminScanHistory from './app/admin-user/AdminScanHistory';
import AdminAnalyticsDashboard from './app/admin-user/AdminAnalyticsDashboard';

import ProfilePage from './app/ProfilePage';
import Signup2 from './app/Signup2';

function App() {
  return (
    <DetectionResultPage />
  );
}

export default App;
