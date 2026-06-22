import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Email and Password are required.");
      return;
    }

    setError("");

    navigate("/home");
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: "100%",
            p: 4,
            borderRadius: 2,
          }}
        >
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography sx={{ fontWeight: 700 }}>Login</Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Sign in to continue
                </Typography>
              </Box>

              {error && <Alert severity="error">{error}</Alert>}

              <TextField
                label="Email"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <TextField
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button type="submit" variant="contained" size="large" fullWidth>
                Login
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
