import React, { useState } from "react";
import {
  Grid,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  // ========== 🔧 state management ==========
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ========== 🔧 functions ==========
  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rememberMe' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      // Store tokens and user data
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Trigger a storage event for Navbar to detect
      window.dispatchEvent(new Event('storage'));
      
      // Login successful - redirect to appropriate dashboard
      if (data.user.is_admin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ========== 🎨 views ==========
  const renderLeftSide = () => (
    <Grid
      item
      xs={12}
      md={6}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "50%",
      }}
    >
      <Paper elevation={6} square sx={{ width: "75%", maxWidth: 400, p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Sign in
        </Typography>
        <Typography color="text.secondary" mb={2}>
          Please login to continue to your account.
        </Typography>

        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleInputChange}
            error={!!errors.email}
            helperText={errors.email}
          />

          <TextField
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            value={formData.password}
            onChange={handleInputChange}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleTogglePassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <FormControlLabel 
            control={
              <Checkbox 
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
              />
            } 
            label="Keep me logged in" 
          />

          <Button 
            type="submit"
            fullWidth 
            variant="contained" 
            sx={{ mt: 2, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Sign in'}
          </Button>
        </form>

        <Typography variant="body2" align="center">
          Need an account?{" "}
          <Link href="/auth/register" underline="hover">
            Create one
          </Link>
        </Typography>
      </Paper>
    </Grid>
  );

  const renderRightSide = () => (
    <Grid
      item
      xs={12}
      md={6}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        height: "100vh",
        width: "50%",
        p: 4,
      }}
    >
      <Grid
        sx={{
          backgroundColor: "#3B82F6",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          height: "80vh",
          width: "100%",
          borderRadius: 5,
          p: 4,
        }}
      >
        <img
          src="/login.png"
          alt="Malicious Detection"
          style={{ width: "500px", marginBottom: "2rem" }}
        />
        <Typography variant="h5" fontWeight="bold">
        Malicious Detection.
        </Typography>
        <Typography variant="subtitle1">That Doesn't Suck!</Typography>
      </Grid>
    </Grid>
  );

  // ========== 🧱 final render ==========
  return (
    <Grid container sx={{ height: "100vh" }}>
      {renderLeftSide()}
      {renderRightSide()}
    </Grid>
  );
}

export default LoginPage;
