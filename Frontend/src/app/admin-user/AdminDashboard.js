import React, { useState, useEffect } from "react";
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from "recharts";

function AdminDashboard() {
  const [tab, setTab] = useState(0);
  // State for dashboard stats
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch dashboard stats on mount
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/dashboard_stats.json');
        //http://localhost:5001/api/dashboard/stats
        if (!res.ok) throw new Error('Failed to fetch dashboard stats');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  // Prepare data for Usage Chart (total_scans)
  const usageData = stats && stats.usage_by_day
    ? stats.usage_by_day.map(day => ({ month: day.date, usage: day.count }))
    : [];

  // Prepare data for Detections Pie Chart (detection_counts)
  const detectionsData = stats && stats.detection_counts && stats.detection_counts.counts
    ? [
        { name: "DDOS", value: stats.detection_counts.counts.ddos, color: "#ef4444" },
        { name: "Phishing", value: stats.detection_counts.counts.phishing, color: "#fde047" },
        { name: "SQLi", value: stats.detection_counts.counts.sqli, color: "#3b82f6" },
        { name: "Ham", value: stats.detection_counts.counts.ham, color: "#5fd17a" },
      ]
    : [];
  const totalDetections = detectionsData.reduce((sum, item) => sum + item.value, 0);
  const detectionsWithPercent = detectionsData.map(item => ({
    ...item,
    percent: totalDetections ? Math.round((item.value / totalDetections) * 100) : 0
  }));

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
            Insights into this weekly's usage
          </Typography>
          {loading ? (
            <Typography sx={{ color: '#fff' }}>Loading...</Typography>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={usageData} barSize={32} margin={{ top: 16, right: 32, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#bdbdbd" />
                <YAxis stroke="#bdbdbd" />
                <Tooltip />
                <Bar dataKey="usage" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Paper>
        {/* Detections and Phishing Prediction */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
          {/* Detections Pie Chart */}
          <Paper elevation={0} sx={{ background: "#23272e", borderRadius: 4, p: 3, flex: 1 }}>
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600 }}>
              Detections
            </Typography>
            <Typography variant="body2" sx={{ color: "#bdbdbd", mb: 4 }}>
              Insights into this month's scans
            </Typography>
            <Box sx={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
              {loading ? (
                <Typography sx={{ color: '#fff' }}>Loading...</Typography>
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <ResponsiveContainer width={220} height={220} sx={{ marginTop: 2 }}>
                  <PieChart>
                    <Pie
                      data={detectionsWithPercent}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      paddingAngle={2}
                    >
                      {detectionsWithPercent.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
              {/* Custom legend below chart, in two columns, two items each */}
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {detectionsWithPercent.slice(0, 2).map((item) => (
                    <Box key={item.name} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 16, height: 16, borderRadius: "50%", background: item.color }} />
                      <Typography sx={{ color: item.color, fontWeight: 600, ml: 1 }}>{item.name}</Typography>
                      <Typography sx={{ color: "#bdbdbd", fontWeight: 600, ml: 1 }}>{item.percent}%</Typography>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {detectionsWithPercent.slice(2, 4).map((item) => (
                    <Box key={item.name} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 16, height: 16, borderRadius: "50%", background: item.color }} />
                      <Typography sx={{ color: item.color, fontWeight: 600, ml: 1 }}>{item.name}</Typography>
                      <Typography sx={{ color: "#bdbdbd", fontWeight: 600, ml: 1 }}>{item.percent}%</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Paper>
          {/* Total Scans Line Graph */}
          <Paper elevation={0} sx={{ background: "#23272e", borderRadius: 4, p: 3, flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600, alignSelf: "flex-start" }}>
              Total Scans Over Time
            </Typography>
            <Typography variant="body2" sx={{ color: "#bdbdbd", alignSelf: "flex-start", mb: 2 }}>
              Line graph of total scans per day
            </Typography>
           
            <Box sx={{ width: '100%', height: 180, mt: 2 }}>
              {loading ? (
                <Typography sx={{ color: '#fff' }}>Loading...</Typography>
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={usageData} margin={{ top: 16, right: 32, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="month" stroke="#bdbdbd" tick={false} axisLine={false} />
                    <YAxis stroke="#bdbdbd" tick={false} axisLine={false}/>
                    <Tooltip />
                    <Line type="monotone" dataKey="usage" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Box>
             {/* Show total number of scans */}
             {loading ? null : error ? null : (
              <Typography variant="h4" sx={{ color: '#3b82f6', fontWeight: 700, mb: 1, alignSelf: 'center' , mt: 2 }}>
                Total: {stats && stats.total_scans ? stats.total_scans : 0}
              </Typography>
            )}
          </Paper>
        </Stack>
      </Box>
      <Box sx={{ height: 32 }} />
    </Box>
  );
}

export default AdminDashboard; 