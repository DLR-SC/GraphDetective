import React from 'react';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

const MessageAlert = ({ open, message, onClose, severity, autoHideDuration }) => {
  let color = "#000"
  if (severity === "error") {
    color = "#d74141"
  }
  if (severity === "warning") {
    color = "#f08831"
  }
  if (severity === "info") {
    color = "#1976d2"
  }
  if (severity === "success") {
    color = "#4b8f4f"
  }
  return (
    <Snackbar open={open} autoHideDuration={autoHideDuration}>
      <Alert style={{
        backgroundColor: "white",
        border: "1px solid " + color,
        borderLeft: "12px solid " + color,
        borderRadius: "0px"
      }} onClose={onClose} severity={severity}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default MessageAlert;