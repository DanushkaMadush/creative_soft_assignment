import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";

import { fishFarmApi } from "../../api/fishFarm.api";
import type {
  FishFarmEmployeeResponse,
  FishFarmResponse,
  FishFarmUpdateRequest,
} from "../../types/fishFarm.types";
import DeleteConfirmationDialog from "../../components/DeleteConfirmationDialog";
import FarmForm from "./FarmForm";


const BASE_IMAGE_URL = import.meta.env.VITE_API_BASE_URL;

type FarmFormValues = {
  name: string;
  latitude: string;
  longitude: string;
  numberOfCages: string;
  hasBarge: boolean;
  image: File | null;
};

const ViewFarm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [farm, setFarm] = useState<FishFarmResponse | null>(null);
  const [employees, setEmployees] = useState<FishFarmEmployeeResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const form = useForm<FarmFormValues>({
    defaultValues: {
      name: "",
      latitude: "",
      longitude: "",
      numberOfCages: "",
      hasBarge: false,
      image: null,
    },
    mode: "onBlur",
  });

  const fetchFarm = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const [farmData, employeeData] = await Promise.all([
        fishFarmApi.getById(id),
        fishFarmApi.getEmployees(id),
      ]);

      setFarm(farmData);
      setEmployees(employeeData);
    } catch {
      setError("Failed to load farm details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarm();
  }, [id]);

  const handleOpenEdit = () => {
    if (!farm) return;

    setUpdateError(null);

    form.reset({
      name: farm.name,
      latitude: String(farm.latitude),
      longitude: String(farm.longitude),
      numberOfCages: String(farm.numberOfCages),
      hasBarge: farm.hasBarge,
      image: null,
    });

    setEditOpen(true);
  };

  const handleUpdateFarm = async (data: FarmFormValues) => {
    if (!id) return;

    const payload: FishFarmUpdateRequest = {
      name: data.name.trim(),
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      numberOfCages: Number(data.numberOfCages),
      hasBarge: data.hasBarge,
      image: data.image ?? undefined,
    };

    try {
      setUpdateLoading(true);
      setUpdateError(null);

      await fishFarmApi.update(id, payload);
      setEditOpen(false);
      await fetchFarm();
    } catch {
      setUpdateError("Failed to update farm. Please try again.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteFarm = async () => {
    if (!id) return;

    try {
      setDeleteLoading(true);
      setDeleteError(null);

      await fishFarmApi.delete(id);
      navigate("/farms");
    } catch {
      setDeleteError("Failed to delete farm. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

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

        <Stack direction="row" spacing={1}>
          <Button variant="outlined" onClick={() => navigate("/farms")}>
            Back
          </Button>

          <Button
            variant="contained"
            startIcon={<EditIcon />}
            disabled={!farm}
            onClick={handleOpenEdit}
          >
            Edit
          </Button>

          <Button
            color="error"
            variant="outlined"
            startIcon={<DeleteIcon />}
            disabled={!farm}
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
        <>
          <Stack spacing={3}>
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

              <Card sx={{ flex: 1, borderRadius: 3, boxShadow: 3 }}>
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

            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                  Employees
                </Typography>

                {employees.length === 0 ? (
                  <Typography color="text.secondary">
                    No employees assigned to this farm.
                  </Typography>
                ) : (
                  <Stack
                    direction="row"
                    spacing={2}
                    useFlexGap
                    sx={{ flexWrap: "wrap" }}
                  >
                    {employees.map((employee) => (
                      <Card
                        key={employee.id}
                        sx={{
                          width: 180,
                          borderRadius: 3,
                          textAlign: "center",
                          boxShadow: 2,
                        }}
                      >
                        <CardActionArea
                          onClick={() => navigate(`/employees/${employee.id}`)}
                          sx={{ p: 2 }}
                        >
                          <Avatar
                            src={
                              employee.imageUrl
                                ? `${BASE_IMAGE_URL}${employee.imageUrl}`
                                : undefined
                            }
                            alt={employee.name}
                            sx={{
                              width: 80,
                              height: 80,
                              mx: "auto",
                              mb: 1.5,
                            }}
                          />

                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 700 }}
                            noWrap
                          >
                            {employee.name}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            noWrap
                          >
                            {employee.roleName}
                          </Typography>
                        </CardActionArea>
                      </Card>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Stack>

          <Dialog
            open={editOpen}
            onClose={updateLoading ? undefined : () => setEditOpen(false)}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>Edit Farm</DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
              <Stack spacing={2}>
                {updateError && <Alert severity="error">{updateError}</Alert>}

                <FarmForm
                  form={form}
                  submitText="Save Changes"
                  submittingText="Saving..."
                  onSubmit={handleUpdateFarm}
                  onBack={() => setEditOpen(false)}
                  defaultImageUrl={
                    farm.imageUrl
                      ? `${BASE_IMAGE_URL}${farm.imageUrl}`
                      : undefined
                  }
                />
              </Stack>
            </DialogContent>
          </Dialog>

          <DeleteConfirmationDialog
            open={deleteOpen}
            loading={deleteLoading}
            error={deleteError}
            title="Delete Farm"
            itemName={farm.name}
            onClose={() => setDeleteOpen(false)}
            onConfirm={handleDeleteFarm}
          />
        </>
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