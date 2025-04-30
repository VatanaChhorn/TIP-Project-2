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

function LoginPage() {
  // ========== 🔧 functions ==========
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
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
        height: "100vh", // 🧱 full height like right side,
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

        <TextField
          label="Email"
          type="email"
          fullWidth
          margin="normal"
          defaultValue="example@test.com"
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

        <FormControlLabel control={<Checkbox />} label="Keep me logged in" />

        <Button fullWidth variant="contained" sx={{ mt: 2, mb: 2 }}>
          Sign in
        </Button>

        <Typography variant="body2" align="center">
          Need an account?{" "}
          <Link href="#" underline="hover">
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
        height: "100vh", // 🧱 match left side height,
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
          height: "80vh", // 🧱 match left side height,
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
          Phishing Detection.
        </Typography>
        <Typography variant="subtitle1">That Doesn’t Suck!</Typography>
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
