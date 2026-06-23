import { Box, Button, Paper, Typography } from "@mui/material";
import { Link as RouterLink, useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();

  console.error(error);

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
          maxWidth: 520,
          width: "100%",
          p: 4,
          textAlign: "center",
          borderRadius: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }} color="error">
          Something went wrong
        </Typography>

        <Typography variant="body1" sx={{ color: "text.secondary", mt: 2 }}>
          An unexpected error occurred while loading this page.
        </Typography>

        <Button
          component={RouterLink}
          to="/home"
          variant="contained"
          sx={{ mt: 3 }}
        >
          Back to Home
        </Button>
      </Paper>
    </Box>
  );
}
