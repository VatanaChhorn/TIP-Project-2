// DetectionResultPage.js
// This page displays detailed information about a single detection result row.
// It fetches the scan results from localStorage and finds the row by rowIndex from the URL.
// The row data is then passed to child components (SubmittedContentAccordion, SeverityBox, etc.) for display.
// The page is robust to refreshes and direct links, as it does not rely on navigation state.

import React from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Navbar from "../Navbar";
import SeverityBox from "./SeverityBox";
import SubmittedContentAccordion from "./SubmittedContentAccordion";

// Sample detection results for different models
const DETECTION_RESULTS = {
  phishing: {
    classification: {
      confidence: "High",
      prediction: "PHISHING",
      probabilities: {
        Ddos: 0.022059775441870343,
        Phishing: 0.928187840515563,
        Sqli: 0.049752384042566815,
      },
    },
    model_name: "PHISHING/SMS SCAM DETECTION",
    prediction: {
      input: {
        attack_type: "Spam",
        text: "Congratulations! You've been selected for a free iPhone. Reply YES to claim your prize!",
      },
      predicted_label: "phishing",
      prediction: "🚨 Malicious Message",
      probabilities: {
        malicious: 0.94,
        safe: 0.06,
      },
      text: "Spam,Congratulations! You've been selected for a free iPhone. Reply YES to claim your prize!",
    },
    row_index: 66,
  },
  sqli: {
    classification: {
      confidence: "High",
      prediction: "SQLI",
      probabilities: {
        Ddos: 9.513458130765185e-5,
        Phishing: 1.7198509629880701e-6,
        Sqli: 0.9999031455677294,
      },
    },
    model_name: "SQL INJECTION DETECTION",
    prediction: {
      input: {
        attack_type: "SQLi",
        sentence: "SELECT * FROM products WHERE category = 'electronics'",
      },
      predicted_label: "sqli",
      prediction: "✅ Safe Query",
      probabilities: {
        malicious: 0.11,
        safe: 0.89,
      },
      text: "SQLi,SELECT * FROM products WHERE category = 'electronics'",
    },
    row_index: 80,
  },
  ddos: {
    classification: {
      confidence: "High",
      prediction: "DDOS",
      probabilities: {
        Ddos: 0.9552095525907771,
        Phishing: 0.02081024595517572,
        Sqli: 0.02398020145404711,
      },
    },
    model_name: "DDoS ATTACK PREDICTION",
    prediction: {
      input: {
        " ACK Flag Count": "0.0",
        " Active Max": "0.0",
        " Active Min": "0.0",
        " Active Std": "0.0",
        " Average Packet Size": "78.85714285714286",
        " Avg Bwd Segment Size": "60.5",
        " Avg Fwd Segment Size": "74.0",
        " Bwd Avg Bytes/Bulk": "0.0",
        " Bwd Avg Packets/Bulk": "0.0",
        " Bwd Header Length": "160.0",
        " Bwd IAT Max": "29759.0",
        " Bwd IAT Mean": "4289.428571428572",
        " Bwd IAT Min": "2.0",
        " Bwd IAT Std": "11231.18433732826",
        " Bwd PSH Flags": "0.0",
        " Bwd Packet Length Mean": "60.5",
        " Bwd Packet Length Min": "0.0",
        " Bwd Packet Length Std": "37.41275565518111",
        " Bwd Packets/s": "112.26021918807794",
        " Bwd URG Flags": "0.0",
        " CWE Flag Count": "0.0",
        " Destination IP": "172.217.6.194",
        " Destination Port": "443.0",
        " Down/Up Ratio": "1.0",
        " ECE Flag Count": "0.0",
        " Flow Duration": "71263.0",
        " Flow IAT Max": "41020.0",
        " Flow IAT Mean": "5481.76923076923",
        " Flow IAT Min": "1.0",
        " Flow IAT Std": "13471.173526916937",
        " Flow Packets/s": "196.4553835791364",
        " Fwd Avg Bulk Rate": "0.0",
        " Fwd Avg Packets/Bulk": "0.0",
        " Fwd Header Length": "120.0",
        " Fwd Header Length.1": "120.0",
        " Fwd IAT Max": "71041.0",
        " Fwd IAT Mean": "14252.6",
        " Fwd IAT Min": "1.0",
        " Fwd IAT Std": "31745.815949507414",
        " Fwd Packet Length Max": "176.0",
        " Fwd Packet Length Mean": "74.0",
        " Fwd Packet Length Min": "0.0",
        " Fwd Packet Length Std": "81.64312585882539",
        " Fwd URG Flags": "0.0",
        " Idle Max": "0.0",
        " Idle Min": "0.0",
        " Idle Std": "0.0",
        " Inbound": "0.0",
        " Init_Win_bytes_backward": "270.0",
        " Max Packet Length": "176.0",
        " Min Packet Length": "0.0",
        " PSH Flag Count": "0.0",
        " Packet Length Mean": "73.6",
        " Packet Length Std": "62.670111354160326",
        " Packet Length Variance": "3927.542857142856",
        " Protocol": "6.0",
        " RST Flag Count": "1.0",
        " SYN Flag Count": "0.0",
        " Source IP": "192.168.50.8",
        " Source Port": "60122.0",
        " Subflow Bwd Bytes": "484.0",
        " Subflow Bwd Packets": "8.0",
        " Subflow Fwd Bytes": "444.0",
        " Timestamp": "2018-12-01 13:42:45.294791",
        " Total Backward Packets": "8.0",
        " Total Fwd Packets": "6.0",
        " Total Length of Bwd Packets": "484.0",
        " URG Flag Count": "1.0",
        " act_data_pkt_fwd": "3.0",
        " min_seg_size_forward": "20.0",
        "Active Mean": "0.0",
        "Bwd Avg Bulk Rate": "0.0",
        "Bwd IAT Total": "30026.0",
        "Bwd Packet Length Max": "84.0",
        "FIN Flag Count": "0.0",
        "Flow Bytes/s": "13022.185425817042",
        "Flow ID": "172.217.6.194-192.168.50.8-443-60122-6",
        "Fwd Avg Bytes/Bulk": "0.0",
        "Fwd IAT Total": "71263.0",
        "Fwd PSH Flags": "1.0",
        "Fwd Packets/s": "84.19516439105847",
        "Idle Mean": "0.0",
        Init_Win_bytes_forward: "16260.0",
        "Subflow Fwd Packets": "6.0",
        "Total Length of Fwd Packets": "444.0",
      },
      predicted_label: "ddos",
      prediction: "BENIGN",
      probabilities: {
        malicious: 0.013493437783738904,
        safe: 0.9865065622162611,
      },
    },
    row_index: 61,
  },
};

const DDoSDetails = ({ input }) => {
  const safeInput = input || {};
  return (
    <Accordion
      sx={{
        boxShadow: "none",
        "&:before": {
          display: "none",
        },
        border: "1px solid #e0e0e0",
        borderRadius: "8px !important",
        overflow: "hidden",
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e0e0e0",
          "&:hover": {
            backgroundColor: "#fafafa",
          },
          "& .MuiAccordionSummary-content": {
            margin: "12px 0",
          },
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            color: "#1a1a1a",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          Network Traffic Details
        </Typography>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          backgroundColor: "#fafafa",
          padding: "16px",
        }}
      >
        <TableContainer
          component={Paper}
          sx={{
            mt: 0,
            boxShadow: "none",
            border: "1px solid #e0e0e0",
            borderRadius: "4px",
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    backgroundColor: "#f5f5f5",
                    fontWeight: 600,
                    color: "#1a1a1a",
                  }}
                >
                  Parameter
                </TableCell>
                <TableCell
                  sx={{
                    backgroundColor: "#f5f5f5",
                    fontWeight: 600,
                    color: "#1a1a1a",
                  }}
                >
                  Value
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(input || {}).map(([key, value]) => (
                <TableRow
                  key={key}
                  sx={{
                    "&:nth-of-type(odd)": {
                      backgroundColor: "#ffffff",
                    },
                    "&:nth-of-type(even)": {
                      backgroundColor: "#fafafa",
                    },
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                  }}
                >
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{
                      fontWeight: 500,
                      color: "#424242",
                      borderRight: "1px solid #e0e0e0",
                    }}
                  >
                    {key}
                  </TableCell>
                  <TableCell sx={{ color: "#424242" }}>{value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );
};

// const ModelSwitcher = ({ currentModel, onModelChange }) => (
//   <FormControl fullWidth sx={{ mb: 3 }}>
//     <InputLabel>Detection Model</InputLabel>
//     <Select
//       value={currentModel}
//       label="Detection Model"
//       onChange={(e) => onModelChange(e.target.value)}
//     >
//       <MenuItem value="phishing">Phishing/SMS Scam Detection</MenuItem>
//       <MenuItem value="sqli">SQL Injection Detection</MenuItem>
//       <MenuItem value="ddos">DDoS Attack Detection</MenuItem>
//     </Select>
//   </FormControl>
// );

const ModelInfoSection = ({ modelName, attackType }) => (
  <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid #e0e0e0" }}>
    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
      Model Details
    </Typography>
    <Typography variant="body1" sx={{ mb: 1 }}>
      Model: {modelName}
    </Typography>
    <Typography variant="body1" sx={{ mb: 1 }}>
      Attack Type: {attackType}
    </Typography>
  </Box>
);

const ClassificationProbabilities = ({ probabilities }) => (
  <Box>
    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
      Classification Probabilities
    </Typography>
    {Object.entries(probabilities).map(([key, value]) => (
      <Typography key={key} variant="body2" sx={{ mb: 0.5 }}>
        {key}: {(value * 100).toFixed(2)}%
      </Typography>
    ))}
  </Box>
);

const PredictionDetails = ({ details }) => (
  <Box>
    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
      Prediction Details
    </Typography>
    {Object.entries(details).map(([key, value]) => (
      <Typography key={key} variant="body2" sx={{ mb: 0.5 }}>
        {key.charAt(0).toUpperCase() + key.slice(1)}: {(value * 100).toFixed(2)}
        %
      </Typography>
    ))}
  </Box>
);

const AnalysisSection = ({
  classificationProbabilities,
  predictionDetails,
  modelName,
  attackType,
  input,
}) => (
  <Paper
    elevation={0}
    sx={{ p: 3, my: 3, bgcolor: "#f5f5f5", borderRadius: 2 }}
  >
    <Typography variant="h6" sx={{ mb: 2, color: "#111", fontWeight: 700 }}>
      Analysis & Model Information
    </Typography>

    <Grid container spacing={48}>
      <Grid item xs={12} md={6}>
        <ClassificationProbabilities
          probabilities={classificationProbabilities}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <PredictionDetails details={predictionDetails} />
      </Grid>
    </Grid>

    <ModelInfoSection modelName={modelName} attackType={attackType} />

    {modelName === "DDoS ATTACK PREDICTION" && (
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          DDoS Attack Details
        </Typography>
        <DDoSDetails input={input} />
      </Box>
    )}
  </Paper>
);

const ActionButtons = () => (
  <Stack
    direction={{ xs: "column", sm: "row" }}
    spacing={2}
    justifyContent="flex-start"
  >
    <Button
      variant="contained"
      sx={{
        background: "#111",
        color: "#fff",
        fontWeight: 600,
        px: 3,
        borderRadius: 2,
      }}
    >
      Scan Another Message
    </Button>
    <Button
      variant="contained"
      color="primary"
      sx={{ fontWeight: 600, px: 3, borderRadius: 2 }}
    >
      Check Out Dashboard
    </Button>
    <Button variant="outlined" sx={{ fontWeight: 600, px: 3, borderRadius: 2 }}>
      Learn About Phishing
    </Button>
  </Stack>
);

function DetectionResultPage() {
  const location = useLocation();
  const { rowIndex } = useParams();
  const row = location.state;

  const [currentModel, setCurrentModel] = React.useState("phishing");
  const result = DETECTION_RESULTS[currentModel];

  const getSubmittedContent = () => {
    switch (currentModel) {
      case "phishing":
        return result.prediction.input.text;
      case "sqli":
        return result.prediction.input.sentence;
      case "ddos":
        return `Flow ID: ${result.prediction.input["Flow ID"]}`;
      default:
        return "";
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "#fafbfc" }}>
      {/* Navbar at the top */}
      <Navbar />
      <Box sx={{ height: 16 }} />
      <Box sx={{ maxWidth: 900, mx: "auto", px: 2, py: 6 }}>
        <Typography variant="h2" sx={{ fontWeight: 800, mb: 3 }}>
          Detection Details
        </Typography>

        {/* <ModelSwitcher
          currentModel={currentModel}
          onModelChange={setCurrentModel}
        /> */}

        {/* Accordion showing the submitted content (row.text) */}
        <SubmittedContentAccordion row={row} />

        {/* SeverityBox shows the risk/severity, using row data */}
        <SeverityBox
          severity={row?.confidence || row?.classification?.confidence}
          probability={row?.malicious}
          classification={row?.prediction || row?.predicted_label}
        />

        <AnalysisSection
          classificationProbabilities={row?.classification?.probabilities || row?.probabilities || {}}
          predictionDetails={{
            malicious: row?.malicious,
            safe: row?.safe
          }}
          modelName={row?.model_name}
          attackType={row?.prediction}
          input={row?.predictionObj?.input}
        />

        <ActionButtons />

        {/* Table showing all fields of the row for debugging or extra info
        {row && (
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableBody>
                {Object.entries(row).map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell sx={{ fontWeight: "bold", textTransform: "capitalize" }}>{key}</TableCell>
                    <TableCell>
                      {typeof value === "object" && value !== null ? (
                        <pre style={{ margin: 0 }}>{JSON.stringify(value, null, 2)}</pre>
                      ) : (
                        String(value)
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )} */}
      </Box>
    </Box>
  );
}

export default DetectionResultPage;
