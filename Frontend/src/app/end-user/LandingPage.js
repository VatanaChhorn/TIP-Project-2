// LandingPage.js
// This is the main user-facing page for uploading files, running ML scans, and viewing results and model metrics.
// It includes detailed logic for mapping between data labels, display labels, and backend model endpoints.

import React, { useState, useEffect } from "react";
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
  AccordionDetails,
  Divider
} from "@mui/material";
import Navbar from "../Navbar";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useNavigate } from "react-router-dom";
import DetectionResultPage from './DetectionResultPage';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

function LandingPage() {
  // =====================
  // State Management
  // =====================
  // File selected by the user for upload
  const [file, setFile] = useState(null);
  // Error message to display to the user
  const [error, setError] = useState("");
  // Scan result object returned from backend
  const [result, setResult] = useState(null);
  // Metrics object for the main model type (used for initial metrics display)
  const [metrics, setMetrics] = useState(null);
  // Dialog state for showing metrics for a specific attack type
  const [metricsDialogOpen, setMetricsDialogOpen] = useState(false);
  // Which attack type's metrics are being shown in the dialog
  const [metricsDialogLabel, setMetricsDialogLabel] = useState(null);
  // The actual metrics data for the dialog (fetched on demand)
  const [metricsDialogMetrics, setMetricsDialogMetrics] = useState(null);
  // For navigation to detailed result pages
  const navigate = useNavigate();

  // =====================
  // File Upload Handling
  // =====================
  // Handles file selection and validation (type and size)
  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    setError(""); // Clear any previous error
    if (!uploadedFile) return;
    // Only allow CSV files (MIME type check)
    const allowedTypes = ['text/csv'];
    if (!allowedTypes.includes(uploadedFile.type)) {
      setError("Invalid file type. Please upload a CSV file.");
      return;
    }
    // Limit file size to 5MB for performance and backend safety
    if (uploadedFile.size > 5 * 1024 * 1024) {
      setError("File is too large. Maximum size is 5MB.");
      return;
    }
    setFile(uploadedFile);
  };

  // Clears all state, resetting the page to its initial state
  const handleClear = () => {
    setFile(null);
    setError("");
    setResult(null);
    setMetrics(null);
  };

  // =====================
  // Scan and Metrics Fetching
  // =====================
  // Handles the scan process: uploads file, gets results, fetches metrics for the main model type
  const handleScan = async () => {
    if (!file) {
      setError("Please upload a file first");
      return;
    }
    setError("");
    setResult(null);
    setMetrics(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      // Send file to backend for ML processing
      const response = await fetch("http://127.0.0.1:5001/api/ml/process", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Failed to process file");
      }
      const data = await response.json();
      console.log('ML API response:', data); // Debug: see backend response
      setResult(data);
      localStorage.setItem('scanResults', JSON.stringify(data));
      // Fetch metrics for the main model type (based on the first result's model_name)
      // This assumes the first result is representative of the main model used
      const modelType = getModelType(data.results?.[0]?.model_name);
      console.log('Fetching metrics for modelType:', modelType);
      try {
        // Request metrics images from backend for this model type
        const imgRes = await fetch(`http://127.0.0.1:5001/api/ml/metrics/${modelType}`);
        const imgData = await imgRes.json();
        console.log('Metric image data:', imgData);
        setMetrics(imgData); // Store the full metrics object
      } catch (e) {
        setMetrics(null); // If metrics fetch fails, clear metrics
      }
    } catch (err) {
      setError(err.message); // Show error to user
    }
  };

  const columnLabels = {
    index: "No.",
    text: "Submitted Content",
    predicted_label: "Attack Type",
    prediction: "Subtype Label",
    malicious: "Detection Confidence",
    safe: "Safe",
    probabilities: "Classification Probabilities",
    confidence: "Confidence",
    // Add more as needed
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
        model_name: item.model_name,
        text: isDDOS && item.prediction.input && item.prediction.input["Flow ID"]
          ? item.prediction.input["Flow ID"]
          : (item.prediction.input && item.prediction.input.sentence)
            ? item.prediction.input.sentence
            : (item.prediction.input && item.prediction.input.text)
              ? item.prediction.input.text
              : item.prediction.text,
        predicted_label: item.prediction.predicted_label,
        prediction: item.prediction.prediction,
        malicious: probs.malicious,
        safe: probs.safe,
        probabilities: item.prediction.probabilities,
        predictionObj: item.prediction,
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
    // const columns = Array.from( // this is the original way to get the columns
    //   rows.reduce((cols, row) => {
    //     Object.keys(row).forEach((k) => cols.add(k));
    //     return cols;
    //   }, new Set())
    // ).filter(col => col !== 'model_name' && col !== 'predictionObj' && col !== 'safe');

    const columns = [
      'index',
      'text',
      'malicious', // Detection confidence
      'predicted_label',
      'prediction',
      'probabilities',
      'confidence'
      // add/remove as needed
    ];
    return (
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table sx={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <TableHead>
            <TableRow>
              {columns.map((col, idx) => (
                <TableCell
                  key={col}
                  sx={{
                    fontWeight: "bold",
                    textAlign: "center",
                    textTransform: "capitalize",
                    borderRight: idx !== columns.length - 1 ? '0.5px solid #e0e0e0' : undefined,
                    borderBottom: '0.5px solid #e0e0e0',
                    background: '#fafbfc',
                    borderLeft:
                        col === 'malicious' || col === 'probabilities'
                          ? '1.5px solid #e0e0e0'
                          : undefined,
                  }}
                >
                  {columnLabels[col]}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow
                key={idx}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => navigate(`/detection-result/${row.index}`, { state: row })}
              >
                {columns.map((col, colIdx) => (
                  <TableCell
                    key={col}
                    sx={{
                      textAlign: "center",
                      borderRight: colIdx !== columns.length - 1 ? '0.35px solid #dcdcdc' : undefined,
                      borderBottom: '1px solid #e0e0e0',
                      borderLeft:
                        col === 'malicious' || col === 'probabilities'
                          ? '1.5px solid #e0e0e0'
                          : undefined,
                    }}
                  >
                    {col === 'index'
                      ? idx + 1
                      : col === 'malicious' ? (
                        <Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>Malicious</Typography>
                            <Typography variant="body2">{(row.malicious * 100).toFixed(2)}%</Typography>
                          </Box>
                          <Divider sx={{ my: 1 }} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600}}>Safe</Typography>
                            <Typography variant="body2">{(row.safe * 100).toFixed(2)}%</Typography>
                          </Box>
                        </Box>
                      ) : col === 'probabilities' ? (
                        renderProbabilitiesTable(row[col])
                      ) : typeof row[col] === "number" && ["malicious", "Ddos", "Phishing", "Sqli"].includes(col)
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

  // Groups scan results by attack type label for display in accordions
  // This allows each attack type to have its own expandable section
  function groupByAttackLabel(results) {
    const groups = {};
    results.forEach(item => {
      let label = '';
      // Prefer attack_type from prediction input if available (most explicit)
      if (item.prediction && item.prediction.input?.attack_type) {
        label = item.prediction.input.attack_type;
      } else if (item.classification && item.classification.prediction) {
        // Fallback: use classification prediction
        label = item.classification.prediction;
      } else {
        label = 'Unknown'; // Fallback for missing data
      }
      if (!groups[label]) groups[label] = [];
      groups[label].push(item);
    });
    return groups;
  }

  // Maps raw attack type labels to user-friendly display labels
  // Ensures that 'spam', 'phishing', and 'smishing' are all shown as 'Phishing', etc.
  // This is important for consistent UI and user understanding
  function getDisplayLabel(label) {
    if (label.toLowerCase() === "spam" || label.toLowerCase() === "phishing" || label.toLowerCase() === "smishing") return "Phishing";
    if (label.toLowerCase() === "sqli") return "SQLi";
    if (label.toLowerCase() === "ddos") return "DDOS";
    // Add more mappings as needed for new attack types
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  // Maps a model name or label to the backend endpoint string for metrics
  // This is critical: it must match the backend's expected model type keys
  // 'phishing', 'smish', or 'spam' -> 'sms' (for phishing metrics)
  // 'ddos' -> 'ddos', 'sql' -> 'sqli'
  // If the label is not recognized, returns 'null' to prevent invalid requests
  function getModelType(modelName) {
    if (!modelName) return 'null';
    const name = modelName.toLowerCase();
    // This line is crucial for mapping 'spam' (as in your dataset) to the correct backend endpoint
    if (name.includes('phishing') || name.includes('smish') || name.includes('spam')) return 'sms';
    if (name.includes('ddos')) return 'ddos';
    if (name.includes('sql')) return 'sqli';
    return 'null';
  }

  // =====================
  // Effect: Load Cached Results
  // =====================
  // On mount, load cached scan results if available (for persistence across reloads)
  useEffect(() => {
    if (!result) {
      const cached = localStorage.getItem('scanResults');
      if (cached) setResult(JSON.parse(cached));
    }
  }, []);

  // =====================
  // Main Render
  // =====================
  return (
    <Box sx={{ minHeight: "100vh", background: "#fafbfc" }}>
      <Navbar />
      <Box sx={{ height: 16 }} />
      {/* Main Content: Upload, Scan, Results, Metrics Dialog */}
      <Container maxWidth="xl" sx={{ mt: 8, mb: 4 }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Header and instructions */}
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

          {/* Error message display (if any) */}
          {error && (
            <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
              {error}
            </Alert>
          )}

          {/* File upload area: shows either upload prompt or file preview */}
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
              accept=".csv"
            />
            
            {/* Upload prompt (shown if no file is selected) */}
            {!file ? (
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
              // File preview (shown if a file is selected)
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

          {/* Scan and Clear buttons */}
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
            >
              Clear
            </Button>
          </Box>

          {/* Results Table(s) and Accordions for each attack type */}
          <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", mt:2 }}>
            {result && result.results && Object.entries(groupByAttackLabel(result.results)).map(([label, items]) => (
              <Accordion key={label} sx={{ mb: 2, width: "100%" }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6">{getDisplayLabel(label)} Attacks</Typography>
                  {/* Details button: fetches and displays metrics for this attack type */}
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ marginLeft: 'auto' }}
                    onClick={async e => {
                      e.stopPropagation(); // Prevent accordion toggle
                      setMetricsDialogLabel(label); // Set which label's metrics to show
                      const modelType = getModelType(label); // Map label to backend endpoint
                      if (modelType === 'null') {
                        setMetricsDialogMetrics({ error: 'No metrics available for this attack type.' });
                        setMetricsDialogOpen(true);
                        return;
                      }
                      setMetricsDialogOpen(true);
                      try {
                        // Fetch metrics for this attack type from backend
                        const imgRes = await fetch(`http://127.0.0.1:5001/api/ml/metrics/${modelType}`);
                        const imgData = await imgRes.json();
                        setMetricsDialogMetrics(imgData);
                      } catch (err) {
                        setMetricsDialogMetrics({ error: 'Failed to fetch metrics.' });
                      }
                    }}
                  >
                    Details
                  </Button>
                </AccordionSummary>
                <AccordionDetails>
                  {/* Render the results table for this attack type */}
                  {renderTable(items)}
                </AccordionDetails>
              </Accordion>
            ))}
            {/* Model Metrics Dialog: shows images or error for selected attack type */}
            <Dialog open={metricsDialogOpen} onClose={() => { setMetricsDialogOpen(false); setMetricsDialogMetrics(null); }} maxWidth="md" fullWidth>
  <DialogTitle>Model Metrics - {metricsDialogLabel && getDisplayLabel(metricsDialogLabel)}</DialogTitle>
  <DialogContent>
    {metricsDialogMetrics && Object.entries(metricsDialogMetrics).length > 0 ? (
      Object.entries(metricsDialogMetrics).map(([key, value]) => {
        // If the key is 'error' or the value is not a valid base64 image, show as error text
        if (key === 'error' || typeof value !== 'string' || !value.startsWith('iVBORw0KGgo')) {
          return (
            <Typography key={key} color="error" sx={{ mb: 2 }}>
              {typeof value === 'string' ? value : 'No metrics available for this model type.'}
            </Typography>
          );
        }
        // Otherwise, render the image
        return (
          <Box key={key} sx={{ mb: 2, textAlign: 'center' }}>
            <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</Typography>
            <img src={`data:image/png;base64,${value}`} alt={key} style={{ maxWidth: '100%' }} />
          </Box>
        );
      })
    ) : (
      <Typography color="text.secondary">No metrics available for this model type.</Typography>
    )}
  </DialogContent>
</Dialog>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

// This page is the main entry point for end users to scan files and view ML model results and metrics.
// The mapping logic ensures that labels like 'spam' are treated as phishing, and that the correct backend endpoint is used for metrics.
// If you add new attack types or models, update the mapping functions accordingly.

export default LandingPage; 