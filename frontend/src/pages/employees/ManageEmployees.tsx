import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
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
import { employeeApi } from "../../api/employee.api";
import type {
  Employee,
  EmployeeQuery,
  PagedResponse,
} from "../../types/employee.types";
import type { Role } from "../../types/role.types";
import type { FishFarmResponse } from "../../types/fishFarm.types";
import { roleApi } from "../../api/role.api";
import { fishFarmApi } from "../../api/fishFarm.api";

const BASE_IMAGE_URL = import.meta.env.VITE_API_BASE_URL;

const ManageEmployees = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [fishFarmId, setFishFarmId] = useState("");
  const [roleId, setRoleId] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const [roles, setRoles] = useState<Role[]>([]);
  const [fishFarms, setFishFarms] = useState<FishFarmResponse[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPageNumber(1);
    }, 800);

    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: EmployeeQuery = {
        searchTerm: debouncedSearchTerm || undefined,
        fishFarmId: fishFarmId || undefined,
        roleId: roleId || undefined,
        isActive:
          status === "all" ? undefined : status === "active" ? true : false,
        pageNumber,
        pageSize,
      };

      const response: PagedResponse<Employee> =
        await employeeApi.getAll(params);

      setEmployees(response.items);
      setTotalCount(response.totalCount);
    } catch {
      setError("Failed to load employees. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [debouncedSearchTerm, fishFarmId, roleId, status, pageNumber, pageSize]);

  const resetToFirstPage = () => {
    setPageNumber(1);
  };

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const data = await roleApi.getAll();
        setRoles(data);
      } catch (error) {
        setError("Failed to load roles. Please try again.");
      }
    };
    loadRoles();
  }, []);

  useEffect(() => {
    const loadFishFarms = async () => {
      try {
        const result = await fishFarmApi.getAll({
          isActive: true,
          pageNumber: 1,
          pageSize: 100,
        });
        setFishFarms(result.items);
      } catch (error) {
        setError("Failed to load fish farms. Please try again.");
      }
    };
    loadFishFarms();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Manage Employees
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
            onClick={() => navigate("/employees/add")}
          >
            Add New Employee
          </Button>
        </Stack>

        <Card sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                label="Search employees"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Fish Farm</InputLabel>
                <Select
                  label="Fish Farm"
                  value={fishFarmId}
                  onChange={(event) => {
                    setFishFarmId(event.target.value);
                    resetToFirstPage();
                  }}
                >
                  <MenuItem value="">All Farms</MenuItem>
                  {fishFarms.map((farm) => (
                    <MenuItem key={farm.id} value={farm.id}>
                      {farm.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  label="Role"
                  value={roleId}
                  onChange={(event) => {
                    setRoleId(event.target.value);
                    resetToFirstPage();
                  }}
                >
                  <MenuItem value="">All Roles</MenuItem>
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value as typeof status);
                    resetToFirstPage();
                  }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Page Size</InputLabel>
                <Select
                  label="Page Size"
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setPageNumber(1);
                  }}
                >
                  <MenuItem value={6}>6</MenuItem>
                  <MenuItem value={12}>12</MenuItem>
                  <MenuItem value={24}>24</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Card>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && error && (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={fetchEmployees}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {!loading && !error && employees.length === 0 && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6">No employees found</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Try changing your search or filters.
            </Typography>
          </Box>
        )}

        {!loading && !error && employees.length > 0 && (
          <>
            <Grid container spacing={3}>
              {employees.map((employee) => {
                const imageSrc = employee.imageUrl
                  ? `${BASE_IMAGE_URL}${employee.imageUrl}`
                  : null;

                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={employee.id}>
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
                        onClick={() => navigate(`/employees/${employee.id}`)}
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "stretch",
                        }}
                      >
                        {imageSrc ? (
                          <CardMedia
                            component="img"
                            height="180"
                            image={imageSrc}
                            alt={employee.name}
                            sx={{ objectFit: "contain" }}
                          />
                        ) : (
                          <Box
                            sx={{
                              height: 180,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              bgcolor: "action.hover",
                            }}
                          >
                            <Avatar sx={{ width: 72, height: 72 }}>
                              {employee.name.charAt(0).toUpperCase()}
                            </Avatar>
                          </Box>
                        )}

                        <CardContent sx={{ width: "100%", flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }} noWrap>
                            {employee.name}
                          </Typography>

                          <Typography color="text.secondary" noWrap>
                            {employee.roleName}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                            noWrap
                          >
                            {employee.fishFarmName}
                          </Typography>

                          <Typography variant="body2" sx={{ mt: 1 }}>
                            Certified until:{" "}
                            {new Date(
                              employee.certifiedUntil,
                            ).toLocaleDateString()}
                          </Typography>
                        </CardContent>

                        <CardActions sx={{ width: "100%", px: 2, pb: 2 }}>
                          <Chip
                            label={employee.isActive ? "Active" : "Inactive"}
                            color={employee.isActive ? "success" : "default"}
                            size="small"
                          />
                        </CardActions>
                      </CardActionArea>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Pagination
                count={totalPages}
                page={pageNumber}
                color="primary"
                onChange={(_, value) => setPageNumber(value)}
              />
            </Box>
          </>
        )}
      </Stack>
    </Container>
  );
};

export default ManageEmployees;
