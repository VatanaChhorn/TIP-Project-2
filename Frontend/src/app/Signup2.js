import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Link,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CancelIcon from '@mui/icons-material/Cancel';
import Navbar from './Navbar';

export default function Signup2() {
  const [form, setForm] = useState({ email: '', password: '', repassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleClearEmail = () => setForm({ ...form, email: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle signup logic here
    alert('Sign up submitted!');
  };

  // Illustration section
  const renderLeftSide = () => (
    <Grid
      item
      xs={12}
      md={6}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '50%',
      }}
    >
      <Paper elevation={6} square sx={{ width: '75%', maxWidth: 400, p: 3, bgcolor: '#ffb300', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Replace this with your SVG or image */}
        <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700, textAlign: 'center' }}>
          Illustration
        </Typography>
      </Paper>
    </Grid>
  );

  // Signup form section
  const renderRightSide = () => (
    <Grid
      item
      xs={12}
      md={6}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '50%',
      }}
    >
      <Paper elevation={0} square sx={{ width: '75%', maxWidth: 400, p: 3 }}>
        <Typography variant="h4" align="center" fontWeight={500} gutterBottom>
          Sign Up
        </Typography>
        <Typography align="center" color="text.secondary" sx={{ mb: 2 }}>
          Register now, know the problem forever.
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputProps={{
              endAdornment: form.email && (
                <InputAdornment position="end">
                  <IconButton onClick={handleClearEmail} edge="end" size="small">
                    <CancelIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 1 }}
            required
          />
          <TextField
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" size="small">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 1 }}
            required
          />
          <TextField
            label="Re-Password"
            name="repassword"
            type={showRePassword ? 'text' : 'password'}
            value={form.repassword}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowRePassword((s) => !s)} edge="end" size="small">
                    {showRePassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
            required
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              borderRadius: 2,
              fontWeight: 500,
              fontSize: '1.1rem',
              py: 1.2,
              mt: 1,
              mb: 2,
            }}
          >
            Sign Up
          </Button>
        </Box>
        <Typography align="center" color="text.secondary" sx={{ fontSize: 15 }}>
          If you have an account, let's{' '}
          <Link href="#" underline="hover" sx={{ fontWeight: 500 }}>
            Sign in
          </Link>
        </Typography>
      </Paper>
    </Grid>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
      <Navbar />
      <Grid container>
        {renderLeftSide()}
        {renderRightSide()}
      </Grid>
    </Box>
  );
} 