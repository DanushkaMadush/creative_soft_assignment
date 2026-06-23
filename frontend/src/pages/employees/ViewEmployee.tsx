import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { employeeApi } from "../../api/employee.api";
import type { Employee, EmployeeFormValues } from "../../types/employee.types";
import EditEmployeeDialog from "./EditEmployeeDialog";
import DeleteConfirmationDialog from "../../components/DeleteConfirmationDialog";

const BASE_IMAGE_URL = import.meta.env.VITE_API_BASE_URL;

const ViewEmployee = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchEmployee = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await employeeApi.getById(id);
      setEmployee(response);
    } catch {
      setError("Failed to load employee details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const handleUpdateEmployee = async (data: EmployeeFormValues) => {
    if (!id) return;

    const formData = new FormData();
    formData.append("FishFarmId", data.fishFarmId);
    formData.append("RoleId", data.roleId);
    formData.append("Name", data.name.trim());
    formData.append("Email", data.email.trim());
    formData.append("Age", data.age);
    formData.append("CertifiedUntil", data.certifiedUntil);

    if (data.image) {
      formData.append("Image", data.image);
    }

    try {
      setUpdateLoading(true);
      setUpdateError(null);

      await employeeApi.update(id, formData);
      setEditOpen(false);
      await fetchEmployee();
    } catch {
      setUpdateError("Failed to update employee. Please try again.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!id) return;

    try {
      setDeleteLoading(true);
      setDeleteError(null);

      await employeeApi.delete(id);
      navigate("/employees");
    } catch {
      setDeleteError("Failed to delete employee. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const imageSrc = employee?.imageUrl
    ? `${BASE_IMAGE_URL}${employee.imageUrl}`
    : null;

  if (!id) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">Employee ID is missing.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Employee Details
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => navigate("/employees")}>
              Back
            </Button>

            <Button
              variant="contained"
              startIcon={<EditIcon />}
              disabled={!employee}
              onClick={() => {
                setUpdateError(null);
                setEditOpen(true);
              }}
            >
              Edit
            </Button>

            <Button
              color="error"
              variant="outlined"
              startIcon={<DeleteIcon />}
              disabled={!employee}
              onClick={() => {
                setDeleteError(null);
                setDeleteOpen(true);
              }}
            >
              Delete
            </Button>
          </Stack>
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
              <Button color="inherit" size="small" onClick={fetchEmployee}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {!loading && !error && employee && (
          <>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Stack sx={{ alignItems: "center" }} spacing={2}>
                      {imageSrc ? (
                        <Box
                          component="img"
                          src={imageSrc}
                          alt={employee.name}
                          sx={{
                            width: "100%",
                            maxWidth: 280,
                            height: 280,
                            objectFit: "cover",
                            borderRadius: 2,
                          }}
                        />
                      ) : (
                        <Avatar
                          sx={{
                            width: 180,
                            height: 180,
                            fontSize: 64,
                            bgcolor: "action.hover",
                            color: "text.primary",
                          }}
                        >
                          {employee.name.charAt(0).toUpperCase()}
                        </Avatar>
                      )}

                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          {employee.name}
                        </Typography>
                        <Typography color="text.secondary">
                          {employee.roleName}
                        </Typography>
                      </Box>

                      <Chip
                        label={employee.isActive ? "Active" : "Inactive"}
                        color={employee.isActive ? "success" : "default"}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                      Employee Information
                    </Typography>

                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <DetailRow label="Name" value={employee.name} />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <DetailRow label="Email" value={employee.email} />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <DetailRow label="Age" value={employee.age} />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <DetailRow label="Role" value={employee.roleName} />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <DetailRow
                          label="Fish Farm Name"
                          value={employee.fishFarmName}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <DetailRow
                          label="Certified Until"
                          value={new Date(
                            employee.certifiedUntil,
                          ).toLocaleDateString()}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <DetailRow
                          label="Status"
                          value={
                            <Chip
                              label={employee.isActive ? "Active" : "Inactive"}
                              color={employee.isActive ? "success" : "default"}
                              size="small"
                            />
                          }
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <DetailRow label="Employee ID" value={employee.id} />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <EditEmployeeDialog
              open={editOpen}
              employee={employee}
              loading={updateLoading}
              error={updateError}
              onClose={() => setEditOpen(false)}
              onSubmit={handleUpdateEmployee}
            />

            <DeleteConfirmationDialog
              open={deleteOpen}
              loading={deleteLoading}
              error={deleteError}
              title="Delete Employee"
              itemName={employee.name}
              onClose={() => setDeleteOpen(false)}
              onConfirm={handleDeleteEmployee}
            />
          </>
        )}
      </Stack>
    </Container>
  );
};

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <Box>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 600 }}>
      {value}
    </Typography>
  </Box>
);

export default ViewEmployee;