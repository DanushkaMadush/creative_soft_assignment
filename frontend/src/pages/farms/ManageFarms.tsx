import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router";
import { fishFarmApi } from "../../api/fishFarm.api";

const BASE_IMAGE_URL = import.meta.env.VITE_API_BASE_URL;

interface FishFarmResponse {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  numberOfCages: number;
  hasBarge: boolean;
  isActive: boolean;
  imageUrl?: string | null;
}

interface FishFarmQuery {
  searchTerm?: string;
  hasBarge?: boolean;
  isActive?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

type FilterValue = "all" | "true" | "false";

function toBooleanFilter(value: FilterValue): boolean | undefined {
  if (value === "all") return undefined;
  return value === "true";
}

export default function ManageFarms() {
  const navigate = useNavigate();

  const [farms, setFarms] = useState<FishFarmResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [hasBarge, setHasBarge] = useState<FilterValue>("all");
  const [status, setStatus] = useState<FilterValue>("all");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPageNumber(1);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchFarms();
  }, [debouncedSearchTerm, hasBarge, status, pageNumber, pageSize]);

  const fetchFarms = async () => {
    try {
      setLoading(true);
      setError("");

      const query: FishFarmQuery = {
        searchTerm: debouncedSearchTerm || undefined,
        hasBarge: toBooleanFilter(hasBarge),
        isActive: toBooleanFilter(status),
        pageNumber,
        pageSize,
      };

      const result: PagedResult<FishFarmResponse> = await fishFarmApi.getAll(query);

      setFarms(result.items);
      setTotalCount(result.totalCount);
    } catch {
      setError("Failed to load farms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (
    setter: React.Dispatch<React.SetStateAction<FilterValue>>,
    value: FilterValue
  ) => {
    setter(value);
    setPageNumber(1);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 3, justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" } }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Manage Farms
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/farms/add")}
        >
          Add New Farm
        </Button>
      </Stack>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <TextField
          fullWidth
          label="Search farms"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <FormControl fullWidth>
          <InputLabel>Has Barge</InputLabel>
          <Select
            label="Has Barge"
            value={hasBarge}
            onChange={(e) =>
              handleFilterChange(setHasBarge, e.target.value as FilterValue)
            }
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="true">Yes</MenuItem>
            <MenuItem value="false">No</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={status}
            onChange={(e) =>
              handleFilterChange(setStatus, e.target.value as FilterValue)
            }
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="true">Active</MenuItem>
            <MenuItem value="false">Inactive</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: { xs: "100%", md: 140 } }}>
          <InputLabel>Page Size</InputLabel>
          <Select
            label="Page Size"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPageNumber(1);
            }}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={20}>20</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchFarms}>
              Retry
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {!loading && !error && farms.length === 0 && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6">No farms found</Typography>
          <Typography color="text.secondary">
            Try changing your search or filters.
          </Typography>
        </Box>
      )}

      {!loading && !error && farms.length > 0 && (
        <>
          <Grid container spacing={3}>
            {farms.map((farm) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={farm.id}>
                <Card
                  sx={{
                    height: "100%",
                    transition: "box-shadow 0.2s ease, transform 0.2s ease",
                    "&:hover": {
                      cursor: "pointer",
                      boxShadow: 6,
                      transform: "translateY(-2px)",
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => navigate(`/farms/${farm.id}`)}
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "stretch",
                    }}
                  >
                    {farm.imageUrl ? (
                      <CardMedia
                        component="img"
                        height="180"
                        image={`${BASE_IMAGE_URL}${farm.imageUrl}`}
                        alt={farm.name}
                        sx={{ objectFit: "contain" }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 180,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: "grey.200",
                        }}
                      >
                        <Typography color="text.secondary">
                          No image available
                        </Typography>
                      </Box>
                    )}

                    <CardContent sx={{ flexGrow: 1, width: "100%" }}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
                        {farm.name}
                      </Typography>

                      <Typography variant="body2">
                        Latitude: {farm.latitude}
                      </Typography>
                      <Typography variant="body2">
                        Longitude: {farm.longitude}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        Number of cages: {farm.numberOfCages}
                      </Typography>

                      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
                        <Chip
                          label={farm.hasBarge ? "Has Barge" : "No Barge"}
                          color={farm.hasBarge ? "primary" : "default"}
                          size="small"
                        />
                        <Chip
                          label={farm.isActive ? "Active" : "Inactive"}
                          color={farm.isActive ? "success" : "default"}
                          size="small"
                        />
                      </Stack>

                      {/* <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<GroupAddIcon />}
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/farms/${farm.id}/add-employees`);
                        }}
                      >
                        Add Employees
                      </Button> */}
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Pagination
              count={totalPages}
              page={pageNumber}
              onChange={(_, page) => setPageNumber(page)}
              color="primary"
            />
          </Box>
        </>
      )}
    </Box>
  );
}