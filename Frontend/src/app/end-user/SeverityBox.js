import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, CircularProgress, Alert } from "@mui/material";

const severityConfig = {
  low: {
    color: "#5fd17a",
    label: "Low Risk",
    description: "This content is likely to be classified as ham.",
    probabilityText: (p) => `This content is ${Math.round(p * 100)}% likely to be classified as ham.`,
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
    probabilityText: (p) => `This content is ${Math.round(p * 100)}% likely to be classified as suspicious.`,
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
    probabilityText: (p) => `This content is ${Math.round(p * 100)}% likely to be classified as malicious attack.`,
    indicator: [
      { color: "#ef4444", label: "High" },
      { color: "#fde047", label: "Medium" },
      { color: "#5fd17a", label: "Low" },
    ],
  },
};

function SeverityBox({ severity = "high", probability = 0.7, endpoint, classification = "Phishing", children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!endpoint) return;
    setLoading(true);
    setError(null);
    fetch(endpoint)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch severity data");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [endpoint]);

  // Use fetched data if available, otherwise use props
  const effectiveSeverity = data?.severity || severity;
  const effectiveProbability = data?.probability ?? probability;
  const effectiveClassification = data?.classification || classification ;
  const config = severityConfig[effectiveSeverity] || severityConfig.low;

  if (loading) {
    return (
      <Paper elevation={0} sx={{ borderRadius: 3, p: 3, mb: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Paper>
    );
  }
  if (error) {
    return (
      <Paper elevation={0} sx={{ borderRadius: 3, p: 3, mb: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

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
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        Identified as
      </Typography>
      <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>
        {effectiveClassification}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        Threat Level: <Box component="span" sx={{ fontWeight: 900 }}>{config.label}</Box>
      </Typography>
      <Typography sx={{ mb: 1 }}>{config.probabilityText(effectiveProbability)}</Typography>

      {/* Risk Indicator */}
      <Paper
        elevation={0}
        sx={{
          background: effectiveSeverity === "low" ? "#7ee89b" : effectiveSeverity === "medium" ? "#fff9c4" : "#f87171",
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
      {children}
    </Paper>
  );
}

export default SeverityBox; 