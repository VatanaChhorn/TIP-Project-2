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
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

function SignupPage() {
  // ========== 🔧 functions ==========
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
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

        <TextField
          label="Full Name"
          type="text"
          fullWidth
          margin="normal"
        />

        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
        />

        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          fullWidth
          margin="normal"
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
          type={showConfirmPassword ? "text" : "password"}
          fullWidth
          margin="normal"
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
          control={<Checkbox />} 
          label={
            <Typography variant="body2">
              I agree to the <Link href="#" underline="hover">Terms of Service</Link> and <Link href="#" underline="hover">Privacy Policy</Link>
            </Typography>
          } 
        />

        <Button fullWidth variant="contained" sx={{ mt: 2, mb: 2 }}>
          Create Account
        </Button>

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
          src="/illustration.png"
          alt="Phishing Detection"
          style={{ width: "300px", marginBottom: "2rem" }}
        />
        <Typography variant="h5" fontWeight="bold">
          Join Our Community
        </Typography>
        <Typography variant="subtitle1">Start Protecting Yourself Today!</Typography>
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