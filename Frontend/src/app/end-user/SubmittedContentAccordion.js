// SubmittedContentAccordion.js
// This component displays the submitted content for a detection result inside an accordion.
// It receives a 'row' prop (the detection result row object) and displays the 'text' field from that row.
// The accordion is always expanded by default and styled for clarity.
// Used in DetectionResultPage to show the original input/query/message that was analyzed.

import React from "react";
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function SubmittedContentAccordion({ row }) {
  // Display the 'text' field from the row as the submitted content
  const displayContent = row?.text || '';

  return (
    <Accordion defaultExpanded sx={{ mb: 3, background: '#f3f4f6', boxShadow: 'none', borderRadius: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle1">Submitted Content</Typography>
      </AccordionSummary>
      <AccordionDetails>
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
      </AccordionDetails>
    </Accordion>
  );
}

export default SubmittedContentAccordion; 