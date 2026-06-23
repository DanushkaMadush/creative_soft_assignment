import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboardApi";
import DashboardStatCard from "../components/dashboard/DashboardCard";
import type { DashboardData } from "../types/dashboard.types";
import { MapContainer, TileLayer } from "react-leaflet";

export default function HomePage() {
  const { data, isLoading, isError, refetch } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [fishFarms, employees, farmLocations] = await Promise.all([
        dashboardApi.getTotalFishFarms(),
        dashboardApi.getTotalEmployees(),
        dashboardApi.getFishFarmLocations(),
      ]);

      return {
        totalFishFarms: fishFarms.total,
        totalEmployees: employees.total,
        locations: farmLocations,
      };
    },
  });

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Box
        component="section"
        sx={{
          minHeight: { xs: 320, md: 460 },
          position: "relative",
          overflow: "hidden",
          borderRadius: { xs: 0, md: "0 0 40px 40px" },
        }}
      >
        <Box
          component="img"
          src="/fish-farm-hero.jpg"
          alt="Fish farm landscape"
          sx={{
            width: "100%",
            height: "100%",
            position: "absolute",
            inset: 0,
            objectFit: "cover",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(2,6,23,0.7), rgba(2,6,23,0.6))",
          }}
        />

        <Container
          maxWidth="lg"
          sx={{
            position: "relative",
            zIndex: 1,
            minHeight: { xs: 320, md: 460 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <Stack spacing={2} sx={{ maxWidth: 820 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.4rem", sm: "3.2rem", md: "4.5rem" },
                fontWeight: 800,
                color: "common.white",
                letterSpacing: "-0.04em",
                lineHeight: 1.05,
              }}
            >
              Fish Farm Management System
            </Typography>

            <Typography
              sx={{
                color: "rgba(255,255,255,0.86)",
                fontSize: { xs: "1rem", md: "1.15rem" },
              }}
            >
              Monitor farms, employees, and locations from one clean dashboard.
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {isError && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => refetch()}>
                Retry
              </Button>
            }
          >
            Failed to load dashboard data.
          </Alert>
        )}

        {!isLoading && !isError && data && (
          <Stack spacing={5}>
            <Grid container spacing={3} sx={{ justifyContent: "center" }}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <DashboardStatCard
                  text="Total Fish Farms"
                  value={data.totalFishFarms}
                  color="#0284c7"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <DashboardStatCard
                  text="Total Employees"
                  value={data.totalEmployees}
                  color="#16a34a"
                />
              </Grid>
            </Grid>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
                Fish Farm Locations
              </Typography>

              <Box
                sx={{
                  height: { xs: 320, md: 420 },
                  borderRadius: 5,
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "0 18px 45px rgba(15,23,42,0.08)",
                }}
              >
                <MapContainer
                  center={[7.8731, 80.7718]}
                  zoom={7}
                  scrollWheelZoom={false}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                </MapContainer>
              </Box>
            </Box>
          </Stack>
        )}
      </Container>
    </Box>
  );
}
