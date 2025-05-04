import React, { useState } from "react";
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
        Ddos: 0.9973799304887665,
        Phishing: 0.001398670488785604,
        Sqli: 0.0012213990224479816,
      },
    },
    model_name: "DDoS ATTACK PREDICTION",
    prediction: {
      input: {
        " ACK Flag Count": "0.0",
        " Active Max": "0.0",
        " Active Min": "0.0",
        " Active Std": "0.0",
        " Average Packet Size": "2208.0",
        " Avg Bwd Segment Size": "0.0",
        " Avg Fwd Segment Size": "1472.0",
        " Bwd Avg Bytes/Bulk": "0.0",
        " Bwd Avg Packets/Bulk": "0.0",
        " Bwd Header Length": "0.0",
        " Bwd IAT Max": "0.0",
        " Bwd IAT Mean": "0.0",
        " Bwd IAT Min": "0.0",
        " Bwd IAT Std": "0.0",
        " Bwd PSH Flags": "0.0",
        " Bwd Packet Length Mean": "0.0",
        " Bwd Packet Length Min": "0.0",
        " Bwd Packet Length Std": "0.0",
        " Bwd Packets/s": "0.0",
        " Bwd URG Flags": "0.0",
        " CWE Flag Count": "0.0",
        " Destination IP": "192.168.50.1",
        " Destination Port": "9928.0",
        " Down/Up Ratio": "0.0",
        " ECE Flag Count": "0.0",
        " Flow Duration": "2.0",
        " Flow IAT Max": "2.0",
        " Flow IAT Mean": "2.0",
        " Flow IAT Min": "2.0",
        " Flow IAT Std": "0.0",
        " Flow Packets/s": "1000000.0",
        " Fwd Avg Bulk Rate": "0.0",
        " Fwd Avg Packets/Bulk": "0.0",
        " Fwd Header Length": "-2125437950.0",
        " Fwd Header Length.1": "-2125437950.0",
        " Fwd IAT Max": "2.0",
        " Fwd IAT Mean": "2.0",
        " Fwd IAT Min": "2.0",
        " Fwd IAT Std": "0.0",
        " Fwd Packet Length Max": "1472.0",
        " Fwd Packet Length Mean": "1472.0",
        " Fwd Packet Length Min": "1472.0",
        " Fwd Packet Length Std": "0.0",
        " Fwd URG Flags": "0.0",
        " Idle Max": "0.0",
        " Idle Min": "0.0",
        " Idle Std": "0.0",
        " Inbound": "1.0",
        " Init_Win_bytes_backward": "-1.0",
        " Max Packet Length": "1472.0",
        " Min Packet Length": "1472.0",
        " PSH Flag Count": "0.0",
        " Packet Length Mean": "1472.0",
        " Packet Length Std": "0.0",
        " Packet Length Variance": "0.0",
        " Protocol": "17.0",
        " RST Flag Count": "0.0",
        " SYN Flag Count": "0.0",
        " Source IP": "172.16.0.5",
        " Source Port": "755.0",
        " Subflow Bwd Bytes": "0.0",
        " Subflow Bwd Packets": "0.0",
        " Subflow Fwd Bytes": "2944.0",
        " Timestamp": "2018-12-01 11:06:12.075848",
        " Total Backward Packets": "0.0",
        " Total Fwd Packets": "2.0",
        " Total Length of Bwd Packets": "0.0",
        " URG Flag Count": "0.0",
        " act_data_pkt_fwd": "1.0",
        " min_seg_size_forward": "-1062718975.0",
        "Active Mean": "0.0",
        "Bwd Avg Bulk Rate": "0.0",
        "Bwd IAT Total": "0.0",
        "Bwd Packet Length Max": "0.0",
        "FIN Flag Count": "0.0",
        "Flow Bytes/s": "1472000000.0",
        "Flow ID": "172.16.0.5-192.168.50.1-755-9928-17",
        "Fwd Avg Bytes/Bulk": "0.0",
        "Fwd IAT Total": "2.0",
        "Fwd PSH Flags": "0.0",
        "Fwd Packets/s": "1000000.0",
        "Idle Mean": "0.0",
        Init_Win_bytes_forward: "-1.0",
        "Subflow Fwd Packets": "2.0",
        "Total Length of Fwd Packets": "2944.0",
        prediction: "DrDoS_DNS",
      },
      predicted_label: "ddos",
      prediction: "DrDoS_DNS",
    },
    row_index: 58,
  },
};

const DDoSDetails = ({ input }) => {
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
              {Object.entries(input).map(([key, value]) => (
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

const ModelSwitcher = ({ currentModel, onModelChange }) => (
  <FormControl fullWidth sx={{ mb: 3 }}>
    <InputLabel>Detection Model</InputLabel>
    <Select
      value={currentModel}
      label="Detection Model"
      onChange={(e) => onModelChange(e.target.value)}
    >
      <MenuItem value="phishing">Phishing/SMS Scam Detection</MenuItem>
      <MenuItem value="sqli">SQL Injection Detection</MenuItem>
      <MenuItem value="ddos">DDoS Attack Detection</MenuItem>
    </Select>
  </FormControl>
);

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
  const [currentModel, setCurrentModel] = useState("phishing");
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
      <Navbar />
      <Box sx={{ height: 8 }} />
      <Box sx={{ maxWidth: 900, mx: "auto", px: 2, py: 6 }}>
        <Typography variant="h2" sx={{ fontWeight: 800, mb: 3 }}>
          Detection Details
        </Typography>

        <ModelSwitcher
          currentModel={currentModel}
          onModelChange={setCurrentModel}
        />

        <SubmittedContentAccordion content={getSubmittedContent()} />

        <SeverityBox
          severity={result.classification.confidence.toLowerCase()}
          probability={
            result.classification.prediction === "SQLI" || result.classification.prediction === "PHISHING"
              ? result.prediction.probabilities.malicious
              : result.classification.probabilities.Ddos
          }
          classification={result.prediction.prediction.toUpperCase()}
        />

        <AnalysisSection
          classificationProbabilities={result.classification.probabilities}
          predictionDetails={
            currentModel === "ddos"
              ? {
                  malicious: result.classification.probabilities.Ddos,
                  safe: 1 - result.classification.probabilities.Ddos,
                }
              : result.prediction.probabilities
          }
          modelName={result.model_name}
          attackType={result.prediction.prediction}
          input={result.prediction.input}
        />

        <ActionButtons />
      </Box>
    </Box>
  );
}

export default DetectionResultPage;
