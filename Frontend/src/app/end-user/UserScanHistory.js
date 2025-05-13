import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import Navbar from "../Navbar";

const scanResults = [
  {
    content: "Your account has been suspended. Click this link to verify your identity: http://fake-link.com",
    threat: 97,
    scan: "Threat",
    time: "2024-03-03 19:09:17",
  },
  {
    content: "Hello world. This message is not smishing.",
    threat: 21,
    scan: "Safe",
    time: "2024-03-03 19:09:17",
  },
];

export default function ScanHistory() {
  const [tab, setTab] = useState(2); // History tab selected by default

  return (
    <Box sx={{ minHeight: "100vh", background: "#fafbfc" }}>
      <Navbar />
      <Box sx={{ height: 16 }} />
      {/* Scan History Table Section */}
      <Box sx={{ maxWidth: 1200, mx: "auto", mt: 6 }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button variant="contained" sx={{ borderRadius: 2, fontWeight: 500, px: 3 }}>
            Export
          </Button>
        </Box>
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 0 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: "#f5f6fa" }}>
                <TableCell sx={{ fontWeight: 600 }}>Content</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Threat Percentage</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Scans</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Scan Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scanResults.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.content}</TableCell>
                  <TableCell>{row.threat}%</TableCell>
                  <TableCell>
                    {row.scan === "Threat" ? (
                      <Chip label="Threat" color="error" size="small" sx={{ bgcolor: '#fde0e6', color: '#e53935', fontWeight: 600 }} />
                    ) : (
                      <Chip label="Safe" color="success" size="small" sx={{ bgcolor: '#e0f7fa', color: '#26a69a', fontWeight: 600 }} />
                    )}
                  </TableCell>
                  <TableCell>{row.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
} 