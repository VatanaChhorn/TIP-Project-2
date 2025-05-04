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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from "@mui/material";
import Navbar from "../Navbar";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function LandingPage() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

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
    setResult(null);
  };

  const handleScan = async () => {
    if (!file) {
      setError("Please upload a file first");
      return;
    }
    setError("");
    setResult(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("http://127.0.0.1:5001/api/ml/process", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to process file");
      }
      const data = await response.json();
      console.log('ML API response:', data);
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
  };

  // Helper to flatten result item for table display
  function flattenResult(item) {
    let row = {};
    let isDDOS = false;
    if (item.prediction) {
      isDDOS = (item.prediction.predicted_label && item.prediction.predicted_label.toLowerCase() === "ddos");
      const probs = item.prediction.probabilities || {};
      row = {
        index: item.row_index,
        text: isDDOS && item.prediction.input && item.prediction.input["Flow ID"]
          ? item.prediction.input["Flow ID"]
          : item.prediction.text,
        predicted_label: item.prediction.predicted_label,
        prediction: item.prediction.prediction,
        malicious: probs.malicious,
        safe: probs.safe,
        probabilities: item.prediction.probabilities,
      };
    }
    if (item.classification) {
      const probs = item.classification.probabilities || {};
      row = {
        ...row,
        confidence: item.classification.confidence,
        predicted_label: row.predicted_label || item.classification.prediction,
        malicious: probs.malicious || row.malicious,
        safe: probs.safe || row.safe,
        probabilities: item.classification.probabilities || row.probabilities,
      };
    }
    return row;
  }

  function renderProbabilitiesTable(probabilities) {
    if (!probabilities) return null;
    return (
      <Table size="small">
        <TableBody>
          {Object.entries(probabilities).map(([key, value]) => (
            <TableRow key={key}>
              <TableCell sx={{ fontWeight: "bold" }}>{key.charAt(0).toUpperCase() + key.slice(1)}</TableCell>
              <TableCell>{(value * 100).toFixed(2)}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  const renderTable = (result) => {
    if (!Array.isArray(result) || result.length === 0) return <div>No results</div>;
    const rows = result.map(flattenResult);
    const columns = Array.from(
      rows.reduce((cols, row) => {
        Object.keys(row).forEach((k) => cols.add(k));
        return cols;
      }, new Set())
    );
    return (
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col} sx={{ fontWeight: "bold", textAlign: "center", textTransform: "capitalize" }}>{col}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={idx}>
                {columns.map((col) => (
                  <TableCell key={col}>
                    {col === 'index'
                      ? idx + 1
                      : col === 'probabilities'
                        ? renderProbabilitiesTable(row[col])
                        : typeof row[col] === "number" && ["malicious", "safe", "Ddos", "Phishing", "Sqli"].includes(col)
                          ? (row[col] * 100).toFixed(2) + '%'
                          : typeof row[col] === "number"
                            ? row[col].toFixed(2)
                            : row[col] !== undefined
                              ? String(row[col])
                              : ""}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Grouping function for attack types
  function groupByAttackLabel(results) {
    const groups = {};
    results.forEach(item => {
      let label = '';
      if (item.prediction && item.prediction.input?.attack_type) {
        label = item.prediction.input.attack_type;
      } else if (item.classification && item.classification.prediction) {
        label = item.classification.prediction;
      } else {
        label = 'Unknown';
      }
      if (!groups[label]) groups[label] = [];
      groups[label].push(item);
    });
    return groups;
  }

  // Label mapping function
  function getDisplayLabel(label) {
    if (label.toLowerCase() === "spam") return "Phishing";
    if (label.toLowerCase() === "sqli") return "SQLi";
    if (label.toLowerCase() === "ddos") return "DDOS";
    // Add more mappings as needed
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  return (
    <Box sx={{ minHeight: "100vh", background: "#fafbfc" }}>
      <Navbar />
      <Box sx={{ height: 16 }} />
      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: 8, mb: 4 }}>
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
            sx={{ mb: 4, maxWidth: 800 }}
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
              width: "50%", 
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

          {/* Results Table(s) */}
          <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", mt:2 }}>
            {result && result.results && Object.entries(groupByAttackLabel(result.results)).map(([label, items]) => (
              <Accordion key={label} sx={{ mb: 2, width: "100%" }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">{getDisplayLabel(label)} Attacks</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {renderTable(items)}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default LandingPage; 