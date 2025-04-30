import React from "react";
import {
  Typography,
  Button,
  Box,
  Container,
  TextField,
  Paper,
  Chip,
} from "@mui/material";
import Navbar from "../Navbar";

function LandingPage() {
  return (
    <Box sx={{ minHeight: "100vh", background: "#fafbfc" }}>
      <Navbar />
      <Box sx={{ height: 16 }} />
      {/* Main Content */}
      <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Chip
            label="MALICIOUS ATTACK DETECTION"
            color="primary"
            sx={{ mb: 2, px: 2, fontWeight: 600, fontSize: 14, letterSpacing: 0.5 }}
          />
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            ML-Powered Real-Time Detection Now Live
          </Typography>
          <Typography
            variant="h2"
            align="center"
            sx={{ fontWeight: 800, mb: 2, fontSize: { xs: 36, md: 56 } }}
          >
            Malicious Detection.<br />Simplified.
          </Typography>
          <Typography
            variant="h6"
            align="center"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 600 }}
          >
            Advanced protection from Phishing, DDoS, SQLInjectiion threats.<br />
            Detect, analyze, and act—before damage is done.
          </Typography>

          <Paper elevation={0} sx={{ width: "100%", p: 2, mb: 2, background: "#fff" }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Enter your content
            </Typography>
            <TextField
              multiline
              minRows={6}
              fullWidth
              variant="outlined"
              defaultValue={
                '“Your account has been suspended. Click this link to verify your identity: http://fake-link.com”'
              }
              sx={{ background: "#fafbfc" }}
            />
          </Paper>

          <Box sx={{ display: "flex", gap: 2, width: "100%", justifyContent: "center" }}>
            <Button variant="contained" color="primary" sx={{ px: 6, borderRadius: 2 }}>
              Scan
            </Button>
            <Button variant="outlined" color="primary" sx={{ px: 6, borderRadius: 2 }}>
              Clear
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default LandingPage; 