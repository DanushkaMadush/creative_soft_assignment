import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate, useParams } from "react-router";
import { fishFarmApi } from "../../api/fishFarm.api";

const BASE_IMAGE_URL = import.meta.env.VITE_API_BASE_URL;

type FishFarmResponse = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  numberOfCages: number;
  hasBarge: boolean;
  isActive: boolean;
  imageUrl?: string | null;
};

const ViewFarm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [farm, setFarm] = useState<FishFarmResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFarm = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const data = await fishFarmApi.getById(id);
      setFarm(data);
    } catch {
      setError("Failed to load farm details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarm();
  }, [id]);

  if (!id) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Farm ID is missing.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          mb: 3,
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Farm Details
        </Typography>

        <Button
          variant="outlined"
          onClick={() => navigate("/farms")}
        >
          Back
        </Button>
      </Stack>

      {loading && (
        <Box
          sx={{
            minHeight: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={fetchFarm}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {!loading && !error && farm && (
        <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
          <Card
            sx={{
              width: { xs: "100%", md: 420 },
              borderRadius: 3,
              overflow: "hidden",
              boxShadow: 3,
            }}
          >
            {farm.imageUrl ? (
              <Box
                component="img"
                src={`${BASE_IMAGE_URL}${farm.imageUrl}`}
                alt={farm.name}
                sx={{
                  width: "100%",
                  height: { xs: 240, md: 360 },
                  objectFit: "contain",
                  display: "block",
                }}
              />
            ) : (
              <Box
                sx={{
                  height: { xs: 240, md: 360 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "grey.100",
                  color: "text.secondary",
                }}
              >
                <Typography variant="body1">No image available</Typography>
              </Box>
            )}
          </Card>

          <Card
            sx={{
              flex: 1,
              borderRadius: 3,
              boxShadow: 3,
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="overline" color="text.secondary">
                    Farm Name
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {farm.name}
                  </Typography>
                </Box>

                <Divider />

                <DetailItem label="Latitude" value={farm.latitude} />
                <DetailItem label="Longitude" value={farm.longitude} />
                <DetailItem
                  label="Number of Cages"
                  value={farm.numberOfCages}
                />

                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Has Barge
                  </Typography>
                  <Box>
                    <Chip
                      label={farm.hasBarge ? "Has Barge" : "No Barge"}
                      color={farm.hasBarge ? "success" : "default"}
                      variant={farm.hasBarge ? "filled" : "outlined"}
                    />
                  </Box>
                </Stack>

                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Box>
                    <Chip
                      label={farm.isActive ? "Active" : "Inactive"}
                      color={farm.isActive ? "success" : "error"}
                    />
                  </Box>
                </Stack>

                <DetailItem label="Farm ID" value={farm.id} />
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      )}
    </Box>
  );
};

type DetailItemProps = {
  label: string;
  value: string | number;
};

const DetailItem = ({ label, value }: DetailItemProps) => (
  <Stack spacing={0.5}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 600 }}>
      {value}
    </Typography>
  </Stack>
);

export default ViewFarm;
