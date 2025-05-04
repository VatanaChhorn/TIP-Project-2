import React, { useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
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
import AdminNavbar from "../admin-user/AdminNavbar";

const users = [
  { email: "UserA@test.com", scans: 9, type: "Premium", created: "2024-03-01 19:09:17" },
  { email: "UserB@test.com", scans: 21, type: "Free", created: "2024-03-02 20:09:17" },
  { email: "UserC@test.com", scans: 8, type: "Free", created: "2024-03-03 21:09:17" },
];

export default function AdminUserDashboard() {
  const [tab, setTab] = useState(1); // Users tab selected by default

  return (
    <Box sx={{ minHeight: "100vh", background: "#fafbfc" }}>
      <Navbar />
      <Box sx={{ height: 16 }} />
      <AdminNavbar tab={tab} setTab={setTab} />
      
      {/* Users Table Section */}
      <Box sx={{ maxWidth: 1200, mx: "auto", mt: 6 }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button variant="contained" sx={{ borderRadius: 2, fontWeight: 500, px: 3 }}>
            Add Users
          </Button>
        </Box>
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 0 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: "#f5f6fa" }}>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Scans</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Created Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user, idx) => (
                <TableRow key={user.email}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.scans}</TableCell>
                  <TableCell>
                    {user.type === "Premium" ? (
                      <Chip label="Premium" color="success" size="small" sx={{ bgcolor: '#e0f7fa', color: '#26a69a', fontWeight: 600 }} />
                    ) : (
                      <Chip label="Free" color="warning" size="small" sx={{ bgcolor: '#fff9c4', color: '#fbc02d', fontWeight: 600 }} />
                    )}
                  </TableCell>
                  <TableCell>{user.created}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
} 