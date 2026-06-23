import { Box, Button, Typography, Paper } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import HomeIcon from "@mui/icons-material/Home";

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "70vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 480,
          width: "100%",
          p: 4,
          textAlign: "center",
          borderRadius: 3,
        }}
      >
        <Typography variant="h2" sx={{ fontWeight: 700, color: "primary" }}>
          404
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: 600, mt: 1 }}>
          Page Not Found
        </Typography>

        <Typography variant="body1" sx={{ color: "text.secondary", mt: 2 }}>
          The page you are looking for does not exist or has been moved.
        </Typography>

        <Button
          component={RouterLink}
          to="/home"
          variant="contained"
          startIcon={<HomeIcon />}
          sx={{ mt: 3 }}
        >
          Go to Home
        </Button>
      </Paper>
    </Box>
  );
}
