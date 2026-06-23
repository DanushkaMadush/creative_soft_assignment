import { Box, Container, Stack, Typography } from "@mui/material";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        py: 2.5,
        mt: "auto",
        bgcolor: "grey.100",
        borderTop: "1px solid",
        borderColor: "grey.300",
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Fish Farm Management System © {currentYear}
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
