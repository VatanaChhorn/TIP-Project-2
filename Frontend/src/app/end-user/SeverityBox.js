// SeverityBox.js
// This component displays a summary card showing the risk/severity of a detection result.
// It uses the severity, probability, and classification props to determine the color, label, and risk indicator.
// The severity is mapped from the probability (high, medium, low) and controls the color and label.
// The probability is shown as a percentage, and the classification is shown as the main label.
// The component is used in DetectionResultPage to show the risk for the selected row.

import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, CircularProgress, Alert } from "@mui/material";

// Configuration for severity levels: color, label, description, and indicator colors
const severityConfig = {
  low: {
    color: "#5fd17a",
    label: "Low Risk",
    description: "This content is likely to be classified as ham.",
    indicator: [
      { color: "#ef4444", label: "High" },
      { color: "#fde047", label: "Medium" },
      { color: "#5fd17a", label: "Low" },
    ],
  },
  medium: {
    color: "#fde047",
    label: "Medium Risk",
    description: "This content may be suspicious.",
    indicator: [
      { color: "#ef4444", label: "High" },
      { color: "#fde047", label: "Medium" },
      { color: "#5fd17a", label: "Low" },
    ],
  },
  high: {
    color: "#ef4444",
    label: "High Risk",
    description: "This content is likely to be malicious attack.",
    indicator: [
      { color: "#ef4444", label: "High" },
      { color: "#fde047", label: "Medium" },
      { color: "#5fd17a", label: "Low" },
    ],
  },
};

// SeverityBox component
// Props:
//   severity: string ("high", "medium", "low")
//   probability: number (0-1, likelihood of malicious)
//   classification: string (e.g., "Phishing", "SQLi", etc.)
//   children: any (optional, for extra content)
function SeverityBox({ severity = "high", probability = 0.7, classification = "Phishing", children }) {
  // Use fetched data if available, otherwise use props
  const effectiveSeverity = severity;
  const effectiveProbability = probability;
  const effectiveClassification = classification ;
  // Map probability to severity: >0.8 = high, >0.4 = medium, else low
  const mappedSeverity = probability > 0.8 ? "high" : probability > 0.4 ? "medium" : "low";
  const config = severityConfig[mappedSeverity]

  return (
    <Paper
      elevation={0}
      sx={{
        background: config.color,
        borderRadius: 3,
        p: 3,
        mb: 3,
        color: effectiveSeverity === "high" ? "white" : "black",
        transition: "background 0.3s",
      }}
    >
      {/* Main label */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        Identified as
      </Typography>
      <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>
        {effectiveClassification}
      </Typography>
      {/* Threat level and probability */}
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        Threat Level: <Box component="span" sx={{ fontWeight: 900 }}>{config.label}</Box>
      </Typography>
      <Typography sx={{ mb: 1 }}>This content is {Math.round(effectiveProbability * 100)}% likely to be classified as malicious attack.</Typography>

      {/* Risk Indicator */}
      <Paper
        elevation={0}
        sx={{
          background: mappedSeverity === "low" ? "#7ee89b" : mappedSeverity === "medium" ? "#fff9c4" : "#f87171",
          borderRadius: 2,
          p: 2,
          mb: 2,
          display: "flex",
          alignItems: "center",
          gap: 3,
          flexWrap: "wrap",
        }}
      >
        <Typography sx={{ fontWeight: 500, minWidth: 120 }}>Risk Indicator</Typography>
        {config.indicator.map((item) => (
          <Box key={item.label} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 20, height: 20, borderRadius: 1, background: item.color, border: "1px solid #888" }} />
            <Typography>{item.label}</Typography>
          </Box>
        ))}
      </Paper>
      {/* Render any children passed to the component */}
      {children}
    </Paper>
  );
}

export default SeverityBox; 