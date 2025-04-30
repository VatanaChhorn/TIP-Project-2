import React, { useEffect, useState } from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, CircularProgress, Alert } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function SubmittedContentAccordion({ content, endpoint }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!endpoint) return;
    setLoading(true);
    setError(null);
    fetch(endpoint)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch submitted content");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [endpoint]);

  let displayContent = content;
  if (data && data.submittedContent) displayContent = data.submittedContent;

  return (
    <Accordion defaultExpanded sx={{ mb: 3, background: '#f3f4f6', boxShadow: 'none', borderRadius: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle1">Show Submitted Content</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 60 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Box
            sx={{
              borderLeft: "4px solid #d1d5db",
              background: "#f3f4f6",
              px: 3,
              py: 2,
              fontStyle: "italic",
              color: "#555",
            }}
          >
            {displayContent}
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

export default SubmittedContentAccordion; 