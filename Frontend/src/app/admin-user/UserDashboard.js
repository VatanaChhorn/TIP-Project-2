import React, { useState, useEffect } from "react";
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

export default function AdminUserDashboard() {
  const [tab, setTab] = useState(1); // Users tab selected by default
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://127.0.0.1:5001/api/auth/userList");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data.users || []); // Use data.users as per your API response
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">Loading...</TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" style={{ color: 'red' }}>{error}</TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">No users found.</TableCell>
                </TableRow>
              ) : (
                users.map((user, idx) => (
                  <TableRow key={user.email || idx}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.totalScan}</TableCell>
                    <TableCell>
                      {user.is_admin ? (
                        <Chip label="Admin" color="success" size="small" sx={{ bgcolor: '#e0f7fa', color: '#26a69a', fontWeight: 600 }} />
                      ) : (
                        <Chip label="User" color="warning" size="small" sx={{ bgcolor: '#fff9c4', color: '#fbc02d', fontWeight: 600 }} />
                      )}
                    </TableCell>
                    <TableCell>{user.created_at}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
} 