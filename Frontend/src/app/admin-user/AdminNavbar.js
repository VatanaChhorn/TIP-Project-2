import React from "react";
import { Box, Typography, Tabs, Tab } from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import RecentActorsIcon from '@mui/icons-material/RecentActors';

function AdminNavbar({ tab, setTab }) {
  return (
    <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          mt: 8,
          mb: 2,
          borderRadius: 3,
          p: 3,
          background: "linear-gradient(90deg, #e0e7ff 0%, #fef9c3 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#222" }}>
          Dashboard
        </Typography>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ minHeight: 0 }}
          slotProps={{ indicator: { style: { background: "#222" } } }}
        >
          <Tab icon={<HomeIcon />} iconPosition="start" label="Analytics" sx={{ minHeight: 0, fontWeight: 600, color: tab === 0 ? "#222" : "#555", background: tab === 0 ? "#fffde7" : "transparent", borderRadius: 2, mx: 1 }} />
          <Tab icon={<RecentActorsIcon />} iconPosition="start" label="User" sx={{ minHeight: 0, fontWeight: 600, color: tab === 1 ? "#222" : "#555", background: tab === 1 ? "#fffde7" : "transparent", borderRadius: 2, mx: 1 }} />
          <Tab icon={<HistoryIcon />} iconPosition="start" label="History" sx={{ minHeight: 0, fontWeight: 600, color: tab === 2 ? "#222" : "#555", background: tab === 2 ? "#fffde7" : "transparent", borderRadius: 2, mx: 1 }} />
          <Tab icon={<PersonIcon />} iconPosition="start" label="Profile" sx={{ minHeight: 0, fontWeight: 600, color: tab === 3 ? "#222" : "#555", background: tab === 3 ? "#fffde7" : "transparent", borderRadius: 2, mx: 1 }} />
        </Tabs>
      </Box>
  );
}

export default AdminNavbar;