import React, { useState } from "react";
import {
  Typography,
  Button,
  Box,
  Container,
  Paper,
  Chip,
  IconButton,
  Alert,
} from "@mui/material";
import Navbar from "../Navbar";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

function LandingPage() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    
    // Reset error state
    setError("");

    // Validate file
    if (!uploadedFile) {
      return;
    }

    // Check file type (add more types as needed)
    const allowedTypes = ['text/csv'];
    if (!allowedTypes.includes(uploadedFile.type)) {
      setError("Invalid file type. Please upload a CSV file.");
      return;
    }

    // Check file size (5MB limit)
    if (uploadedFile.size > 5 * 1024 * 1024) {
      setError("File is too large. Maximum size is 5MB.");
      return;
    }

    setFile(uploadedFile);
  };

  const handleClear = () => {
    setFile(null);
    setError("");
  };

  const handleScan = async () => {
    if (!file) {
      setError("Please upload a file first");
      return;
    }

    // TODO: Implement file scanning logic
    console.log("Scanning file:", file);
  };

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

          {error && (
            <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
              {error}
            </Alert>
          )}

          <Paper 
            elevation={0} 
            sx={{ 
              width: "100%", 
              p: 3, 
              mb: 2, 
              background: "#fff",
              border: '2px dashed #e0e0e0',
              borderRadius: 2,
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
              },
            }}
          >
            <input
              type="file"
              id="file-upload"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              accept=".txt,.html,.pdf,.json"
            />
            
            {!file ? (
              // Upload prompt
              <Box
                component="label"
                htmlFor="file-upload"
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: 'pointer'
                }}
              >
                <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" color="primary" gutterBottom>
                  Drop your file here or click to upload
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supports CSV (up to 5MB)
                </Typography>
              </Box>
            ) : (
              // File preview
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <InsertDriveFileIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                      {file.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {(file.size / 1024).toFixed(2)} KB
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={handleClear} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}
          </Paper>

          <Box sx={{ display: "flex", gap: 2, width: "100%", justifyContent: "center" }}>
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ px: 6, borderRadius: 2 }}
              onClick={handleScan}
              disabled={!file}
            >
              Scan
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              sx={{ px: 6, borderRadius: 2 }}
              onClick={handleClear}
              disabled={!file}
            >
              Clear
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default LandingPage; 