import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
} from "@mui/material";
import Navbar from "../Navbar";
import AdminNavbar from "./AdminNavbar";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "January", users: 1, scans: 1, accounts: 1 },
  { month: "February", users: 3, scans: 3, accounts: 3 },
  { month: "March", users: 4, scans: 2, accounts: 2 },
  { month: "April", users: 4, scans: 4, accounts: 3 },
];

export default function AdminAnalyticsDashboard() {
  const [tab, setTab] = useState(0); // Analytics tab

  return (
    <Box sx={{ minHeight: "100vh", background: "#fafbfc" }}>
      <Navbar />
      <Box sx={{ height: 16 }} />
      <AdminNavbar tab={tab} setTab={setTab} />
      <Box sx={{ maxWidth: 1200, mx: "auto", mt: 6, display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Active Users */}
        <Paper elevation={0} sx={{ background: "#23272e", borderRadius: 4, p: 3 }}>
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600 }}>
            Active Users
          </Typography>
          <Typography variant="body2" sx={{ color: "#bdbdbd", mb: 2 }}>
            Insights into this month's active users
          </Typography>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="month" stroke="#bdbdbd" />
              <YAxis stroke="#bdbdbd" />
              <Tooltip />
              <Bar dataKey="users" fill="#3b82f6" barSize={64} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
        {/* Total Scans & Account Creations */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
          <Paper elevation={0} sx={{ background: "#23272e", borderRadius: 4, p: 3, flex: 1 }}>
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600 }}>
              Total Scans
            </Typography>
            <Typography variant="body2" sx={{ color: "#bdbdbd", mb: 2 }}>
              Insights into this month's scans
            </Typography>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="month" stroke="#bdbdbd" />
                <YAxis stroke="#bdbdbd" />
                <Tooltip />
                <Bar dataKey="scans" fill="#3b82f6" barSize={64} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
          <Paper elevation={0} sx={{ background: "#23272e", borderRadius: 4, p: 3, flex: 1 }}>
            <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600 }}>
              Account Creations
            </Typography>
            <Typography variant="body2" sx={{ color: "#bdbdbd", mb: 2 }}>
              Insights into this month's account creations
            </Typography>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="month" stroke="#bdbdbd" />
                <YAxis stroke="#bdbdbd" />
                <Tooltip />
                <Bar dataKey="accounts" fill="#3b82f6" barSize={64} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
} 