import React from "react";
import { AppBar, Toolbar, Tabs, Tab, Button, Box } from "@mui/material";

function Navbar({ onTabSelect }) {
  return (
    <AppBar
      position="fixed"
      color="transparent"
      sx={{ backdropFilter: "blur(80px)" }}
      elevation={0}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Tabs
            TabIndicatorProps={{ style: { backgroundColor: "black" } }}
            aria-label="secondary tabs example"
            centered={false}
          >
            <Tab sx={{ color: "black" }} label="Home" onClick={() => onTabSelect && onTabSelect("home")} />
            <Tab sx={{ color: "black" }} label="How's it work?" onClick={() => onTabSelect && onTabSelect("projects")} />
            <Tab sx={{ color: "black" }} label="Dashboard" onClick={() => onTabSelect && onTabSelect("about")} />
          </Tabs>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="outlined" color="primary" sx={{ textTransform: "none", borderRadius: 2 }}>
            Sign in
          </Button>
          <Button variant="contained" color="primary" sx={{ textTransform: "none", borderRadius: 2 }}>
            Sign up
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 