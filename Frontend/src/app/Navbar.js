import React, { useState, useEffect } from "react";
import { 
  AppBar, 
  Toolbar, 
  Tabs, 
  Tab, 
  Button, 
  Box,
  Avatar,
  Menu,
  MenuItem,
  Typography
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getUser, logout } from '../utils/auth';

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser());
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Check authentication status on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      setUser(getUser());
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/');
    handleClose();
  };

  // Navigation handlers
  const handleNavigation = (path) => {
    navigate(path);
  };

  // Render different navigation items based on auth state and user role
  const renderNavigationItems = () => {
    if (!user) {
      // Not logged in
      return (
        <>
          <Tab 
            sx={{ color: "black" }} 
            label="Home" 
            onClick={() => handleNavigation('/')} 
          />
          <Tab 
            sx={{ color: "black" }} 
            label="How's it work?" 
            onClick={() => handleNavigation('/how-it-works')} 
          />
        </>
      );
    } else if (user.is_admin) {
      // Admin user
      return (
        <>
          {/* <Tab 
            sx={{ color: "black" }} 
            label="Dashboard" 
            onClick={() => handleNavigation('/admin')} 
          />
          <Tab 
            sx={{ color: "black" }} 
            label="Scan History" 
            onClick={() => handleNavigation('/admin/scan-history')} 
          />
          <Tab 
            sx={{ color: "black" }} 
            label="Analytics" 
            onClick={() => handleNavigation('/admin/analytics')} 
          /> */}
        </>
      );
    } else {
      // Regular user
      return (
        <>
          <Tab 
            sx={{ color: "black" }} 
            label="Home" 
            onClick={() => handleNavigation('/')} 
          />
          <Tab 
            sx={{ color: "black" }} 
            label="How's it work?" 
            onClick={() => handleNavigation('/how-it-works')} 
          />
          <Tab 
            sx={{ color: "black" }} 
            label="Dashboard" 
            onClick={() => handleNavigation('/scan-history')} 
          />
        </>
      );
    }
  };

  // Render auth buttons or user profile
  const renderAuthSection = () => {
    if (!user) {
      return (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button 
            variant="outlined" 
            color="primary" 
            sx={{ textTransform: "none", borderRadius: 2 }}
            onClick={() => handleNavigation('/auth/login')}
          >
            Sign in
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ textTransform: "none", borderRadius: 2 }}
            onClick={() => handleNavigation('/auth/register')}
          >
            Sign up
          </Button>
        </Box>
      );
    }

    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Button
          onClick={handleProfileClick}
          sx={{ 
            textTransform: "none", 
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Avatar 
            sx={{ width: 32, height: 32 }}
            alt={user.username}
            src="/default-avatar.png"
          />
          <Typography>{user.username}</Typography>
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <MenuItem onClick={() => {
            handleClose();
            handleNavigation('/admin');
          }}>Dashboard</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Box>
    );
  };

  return (
    <AppBar
      position="fixed"
      color="transparent"
      sx={{ backdropFilter: "blur(80px)" }}
      elevation={0}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Tabs
            TabIndicatorProps={{ style: { backgroundColor: "black" } }}
            aria-label="navigation tabs"
            centered={false}
          >
            {renderNavigationItems()}
          </Tabs>
        </Box>
        {renderAuthSection()}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 