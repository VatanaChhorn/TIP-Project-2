import React from "react";
import { Box, Typography, Button, Link, Stack } from "@mui/material";
import Navbar from "../Navbar";
import SeverityBox from "./SeverityBox";
import SubmittedContentAccordion from "./SubmittedContentAccordion";

function DetectionResultPage({
  submittedContent = '“Your account has been suspended. Click this link to verify your identity: http://fake-link.com”',
  severity = "high", // "low", "medium", "high"
  probability = 0.8,
  classification = "Phishing",
}) {
  return (
    <Box sx={{ minHeight: "100vh", background: "#fafbfc" }}>
      <Navbar />
      <Box sx={{ height: 8 }} />
      <Box sx={{ maxWidth: 900, mx: "auto", px: 2, py: 6 }}>
        <Typography variant="h2" sx={{ fontWeight: 800, mb: 3 }}>
          Detection Result
        </Typography>
        <SubmittedContentAccordion content={submittedContent} />
        <SeverityBox severity={severity} probability={probability} classification={classification}>
          <Link href="#" underline="hover" sx={{ fontWeight: 500, color: "#111"}}>
            Suggested Actions
          </Link>
        </SeverityBox>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="flex-start">
          <Button variant="contained" sx={{ background: "#111", color: "#fff", fontWeight: 600, px: 3, borderRadius: 2 }}>
            Scan Another Message
          </Button>
          <Button variant="contained" color="primary" sx={{ fontWeight: 600, px: 3, borderRadius: 2 }}>
            Check Out Dashboard
          </Button>
          <Button variant="outlined" sx={{ fontWeight: 600, px: 3, borderRadius: 2 }}>
            Learn About Phishing
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

export default DetectionResultPage; 