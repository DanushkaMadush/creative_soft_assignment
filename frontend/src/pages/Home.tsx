import {
  Box,
  CircularProgress,
  Container,
  Grid,
  Typography,
  Alert,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboardApi";
import type { FishFarmLocation } from "../types/dashboard.types";
import DashboardStatCard from "../components/dashboard/DashboardCard";

interface DashboardData {
  totalFishFarms: number;
  totalEmployees: number;
  locations: FishFarmLocation[];
}

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
    <Box>
      <Box
        sx={{
          height: { xs: 280, md: 420 },
          position: "relative",
          overflow: "hidden",
          borderRadius: { xs: 0, md: "0 0 36px 36px" },
        }}
      >
        <Box
          component="img"
          src="/fish-farm-hero.jpg"
          alt="Fish Farm"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            px: 2,
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "2.2rem", md: "4rem" },
              fontWeight: 800,
              color: "white",
            }}
          >
            Fish Farm Management System
          </Typography>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {isError && (
          <Alert
            severity="error"
            action={
              <Typography
                component="button"
                onClick={() => refetch()}
                sx={{
                  border: 0,
                  background: "transparent",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Retry
              </Typography>
            }
          >
            Failed to load dashboard data.
          </Alert>
        )}

        {!isLoading && !isError && data && (
          <>
            <Grid
              container
              spacing={3}
              sx={{ mb: 5, justifyContent: "center" }}
            >
              <Grid size={{ xs: 8, sm: 4, md: 2 }}>
                <DashboardStatCard
                  text="Total Fish Farms"
                  value={data.totalFishFarms}
                  color="#0284c7"
                />
              </Grid>

              <Grid size={{ xs: 8, sm: 4, md: 2 }}>
                <DashboardStatCard
                  text="Total Employees"
                  value={data.totalEmployees}
                  color="#16a34a"
                />
              </Grid>
            </Grid>

            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                Fish Farm Locations
              </Typography>

              <Box
                sx={{
                  height: 300,
                  borderRadius: 4,
                  position: "relative",
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                  background:
                    "linear-gradient(135deg, #dbeafe, #ecfeff 45%, #dcfce7)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />

                {data.locations.map((location, index) => (
                  <Box
                    key={location.fishFarmId}
                    sx={{
                      position: "absolute",
                      left: `${28 + index * 18}%`,
                      top: `${35 + index * 12}%`,
                      transform: "translate(-50%, -50%)",
                      textAlign: "center",
                    }}
                  >
                    <Typography sx={{ fontSize: 30 }}>📍</Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: 2,
                        bgcolor: "white",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                        fontWeight: 600,
                      }}
                    >
                      {location.fishFarmName}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}
