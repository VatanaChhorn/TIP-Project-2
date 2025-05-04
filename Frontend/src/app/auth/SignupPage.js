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

function SignupPage() {
  // ========== 🔧 state management ==========
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ========== 🔧 functions ==========
  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'agreeToTerms' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the Terms of Service';
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
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.fullName,
          email: formData.email,
          password: formData.password
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Registration successful
      navigate('/auth/login');
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
          Create Account
        </Typography>
        <Typography color="text.secondary" mb={2}>
          Please fill in your details to create an account.
        </Typography>

        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Full Name"
            name="fullName"
            type="text"
            fullWidth
            margin="normal"
            value={formData.fullName}
            onChange={handleInputChange}
            error={!!errors.fullName}
            helperText={errors.fullName}
          />

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

          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            fullWidth
            margin="normal"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleToggleConfirmPassword} edge="end">
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <FormControlLabel 
            control={
              <Checkbox 
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
              />
            } 
            label={
              <Typography variant="body2">
                I agree to the <Link href="#" underline="hover">Terms of Service</Link> and <Link href="#" underline="hover">Privacy Policy</Link>
              </Typography>
            }
          />
          {errors.agreeToTerms && (
            <Typography color="error" variant="caption" display="block">
              {errors.agreeToTerms}
            </Typography>
          )}

          <Button 
            type="submit"
            fullWidth 
            variant="contained" 
            sx={{ mt: 2, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Create Account'}
          </Button>
        </form>

        <Typography variant="body2" align="center">
          Already have an account?{" "}
          <Link href="/auth/login" underline="hover">
            Sign in
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
          src="/signin.png"
          alt="Malicious Detection"
          style={{ width: "500px", marginBottom: "2rem" }}
        />
        <Typography variant="h5" fontWeight="bold">
          Join Our Community
        </Typography>
        <Typography variant="subtitle1">Protecting Yourself Today! Now or Never.</Typography>
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

export default SignupPage; 