import React, { useState } from "react";
import { Box, Typography, Paper, Button, TextField, Avatar, Stack } from "@mui/material";
import Navbar from "./Navbar";
import AdminNavbar from "./admin-user/AdminNavbar";


function ProfilePage() {
  const [tab, setTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    fullName: "Santa Klaus",
    nickName: "Klos",
    email: "klaussanta@test.com",
    language: "English",
    country: "Australia",
    avatar: "/santa.png",
  });

  return (
    <Box sx={{ minHeight: "100vh", background: "#fafbfc" }}>
      <Navbar />
   
      <Box sx={{ height: 16 }} />
      <AdminNavbar tab={tab} setTab={setTab} />
      <Box sx={{ maxWidth: 900, mx: "auto", mt: 4 }}>
        <Paper elevation={0} sx={{ borderRadius: 4, p: 4 }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Avatar src={profile.avatar} sx={{ width: 80, height: 80 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {profile.fullName}
              </Typography>
              <Typography variant="body2" sx={{ color: "#888" }}>
                {profile.email}
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="contained" onClick={() => setEditMode(!editMode)}>
              {editMode ? "Save" : "Edit"}
            </Button>
          </Stack>
          <Box sx={{ mt: 4 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
              <TextField
                label="Full Name"
                value={profile.fullName}
                disabled={!editMode}
                fullWidth
                variant="outlined"
              />
              <TextField
                label="Nick Name"
                value={profile.nickName}
                disabled={!editMode}
                fullWidth
                variant="outlined"
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ mt: 2 }}>
              <TextField
                label="Language"
                value={profile.language}
                disabled={!editMode}
                fullWidth
                variant="outlined"
              />
              <TextField
                label="Country"
                value={profile.country}
                disabled={!editMode}
                fullWidth
                variant="outlined"
              />
            </Stack>
          </Box>
          <Box sx={{ mt: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              My email Address
            </Typography>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: "#1976d2" }}>@</Avatar>
              <Typography>{profile.email}</Typography>
              <Typography sx={{ color: "#888" }}>1 month ago</Typography>
            </Stack>
            <Button variant="outlined" sx={{ mt: 2 }}>
              + Add Email Address
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default ProfilePage; 