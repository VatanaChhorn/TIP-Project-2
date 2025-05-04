import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import Navbar from "../Navbar";
import AdminNavbar from "./AdminNavbar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const usageData = [
  { month: "January", usage: 1 },
  { month: "February", usage: 3 },
  { month: "March", usage: 4 },
  { month: "April", usage: 8 },
];

const detectionsData = [
  { name: "Safe", value: 6, color: "#5fd17a" },
  { name: "Warning", value: 2, color: "#fde047" },
  { name: "Threat", value: 2, color: "#ef4444" },
];

// Calculate total and percentages for custom legend
const totalDetections = detectionsData.reduce((sum, item) => sum + item.value, 0);
const detectionsWithPercent = detectionsData.map(item => ({
  ...item,
  percent: totalDetections ? Math.round((item.value / totalDetections) * 100) : 0
}));

function AdminDashboard() {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ minHeight: "100vh", background: "#fafbfc" }}>
      <Navbar />
      <Box sx={{ height: 16, mb: 2 }} />
      <AdminNavbar tab={tab} setTab={setTab} />
      {/* Main Dashboard Content */}
      <Box sx={{ maxWidth: 1200, mx: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Usage Chart */}
        <Paper elevation={0} sx={{ background: "#23272e", borderRadius: 4, p: 3, mt: 2 }}>
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600 }}>
            Usage
          </Typography>
          <Typography variant="body2" sx={{ color: "#bdbdbd", mb: 2 }}>
            Insights into this month's usage
          </Typography>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={usageData} barSize={32} margin={{ top: 16, right: 32, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#bdbdbd" />
              <YAxis stroke="#bdbdbd" />
              <Tooltip />
              <Bar dataKey="usage" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
        {/* Detections and Phishing Prediction */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
          {/* Detections Pie Chart */}
          <Paper elevation={0} sx={{ background: "#23272e", borderRadius: 4, p: 3, flex: 1 }}>
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600 }}>
              Detections
            </Typography>
            <Typography variant="body2" sx={{ color: "#bdbdbd", mb: 2 }}>
              Insights into this month's scans
            </Typography>
            <Box sx={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={detectionsWithPercent}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    innerRadius={40}
                    paddingAngle={2}
                  >
                    {detectionsWithPercent.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Custom legend below chart, in a row */}
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 4, mb: 4 }}>
                {detectionsWithPercent.map((item) => (
                  <Box key={item.name} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 16, height: 16, borderRadius: "50%", background: item.color }} />
                    <Typography sx={{ color: item.color, fontWeight: 600, ml: 1 }}>{item.name}</Typography>
                    <Typography sx={{ color: "#bdbdbd", fontWeight: 600, ml: 1 }}>{item.percent}%</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>
          {/* Phishing Prediction Card */}
          <Paper elevation={0} sx={{ background: "#23272e", borderRadius: 4, p: 3, flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600, alignSelf: "flex-start" }}>
              Malicious Attack Prediction
            </Typography>
            <Typography variant="body2" sx={{ color: "#bdbdbd", alignSelf: "flex-start", mb: 2 }}>
              Insights into your prediction
            </Typography>
            <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 24, textAlign: "center", mt: 4 }}>
              80% of suspicious contain an <br /> attack
            </Typography>
          </Paper>
        </Stack>
      </Box>
      <Box sx={{ height: 32 }} />
    </Box>
  );
}

export default AdminDashboard; 