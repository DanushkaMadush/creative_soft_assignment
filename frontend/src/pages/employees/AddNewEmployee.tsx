import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { employeeApi } from "../../api/employee.api";
import type { Role } from "../../types/role.types";
import { roleApi } from "../../api/role.api";
import { fishFarmApi } from "../../api/fishFarm.api";
import type { FishFarmResponse } from "../../types/fishFarm.types";

interface EmployeeFormState {
  fishFarmId: string;
  roleId: string;
  name: string;
  email: string;
  age: string;
  certifiedUntil: string;
  image: File | null;
}

interface EmployeeFormErrors {
  fishFarmId?: string;
  roleId?: string;
  name?: string;
  email?: string;
  age?: string;
  certifiedUntil?: string;
  image?: string;
}

const initialForm: EmployeeFormState = {
  fishFarmId: "",
  roleId: "",
  name: "",
  email: "",
  age: "",
  certifiedUntil: "",
  image: null,
};

function AddNewEmployee() {
  const navigate = useNavigate();

  const [form, setForm] = useState<EmployeeFormState>(initialForm);
  const [errors, setErrors] = useState<EmployeeFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [fishFarms, setFishFarms] = useState<FishFarmResponse[]>([]);

  const imagePreview = form.image ? URL.createObjectURL(form.image) : "";

  useEffect(() => {
    const loadRoles = async () => {
        try {
            const data = await roleApi.getAll();
            setRoles(data);
        } catch (error) {
            setErrorMessage("Failed to load roles. Please try again.");
        }
    }
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
            setErrorMessage("Failed to load fish farms. Please try again.");
        }
    }
    loadFishFarms();
  }, []);

  const validate = () => {
    const nextErrors: EmployeeFormErrors = {};

    if (!form.fishFarmId) nextErrors.fishFarmId = "Fish farm is required.";
    if (!form.roleId) nextErrors.roleId = "Role is required.";
    if (!form.name.trim()) nextErrors.name = "Name is required.";

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    const ageNumber = Number(form.age);
    if (!form.age) {
      nextErrors.age = "Age is required.";
    } else if (Number.isNaN(ageNumber) || ageNumber < 18 || ageNumber > 100) {
      nextErrors.age = "Age must be between 18 and 100.";
    }

    if (!form.certifiedUntil) {
      nextErrors.certifiedUntil = "Certified until date is required.";
    }

    if (form.image && !form.image.type.startsWith("image/")) {
      nextErrors.image = "Only image files are allowed.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!validate()) return;

    const formData = new FormData();
    formData.append("FishFarmId", form.fishFarmId);
    formData.append("RoleId", form.roleId);
    formData.append("Name", form.name);
    formData.append("Email", form.email);
    formData.append("Age", String(form.age));
    formData.append("CertifiedUntil", form.certifiedUntil);

    if (form.image) {
      formData.append("Image", form.image);
    }

    try {
      setSubmitting(true);
      await employeeApi.create(formData);
      setSuccessMessage("Employee created successfully.");
      setTimeout(() => {
        navigate("/employees");
      }, 800);
    } catch {
      setErrorMessage("Failed to create employee. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5} }}>
      <Paper elevation={3} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 3, }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Add New Employee
            </Typography>
          </Box>

          {successMessage && <Alert severity="success">{successMessage}</Alert>}
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ maxWidth: 600, mx: "auto", width: "100%" }}>
            <Grid container spacing={2.5}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={form.name}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={form.email}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Age"
                  type="number"
                  value={form.age}
                  error={Boolean(errors.age)}
                  helperText={errors.age}
                //   inputProps={{ min: 18, max: 100 }}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, age: e.target.value }))
                  }
                />
              </Grid>

              <Grid size={12}>
                <FormControl fullWidth error={Boolean(errors.roleId)}>
                  <InputLabel>Role</InputLabel>
                  <Select
                    label="Role"
                    value={form.roleId}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        roleId: e.target.value,
                      }))
                    }
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        {role.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{errors.roleId}</FormHelperText>
                </FormControl>
              </Grid>

              <Grid size={12}>
                <FormControl fullWidth error={Boolean(errors.fishFarmId)}>
                  <InputLabel>Fish Farm</InputLabel>
                  <Select
                    label="Fish Farm"
                    value={form.fishFarmId}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        fishFarmId: e.target.value,
                      }))
                    }
                  >
                    {fishFarms.map((farm) => (
                      <MenuItem key={farm.id} value={farm.id}>
                        {farm.name}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>{errors.fishFarmId}</FormHelperText>
                </FormControl>
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Employee Certified Until"
                  type="date"
                  value={form.certifiedUntil}
                  error={Boolean(errors.certifiedUntil)}
                  helperText={errors.certifiedUntil}
                  slotProps={{ inputLabel: { shrink: true } }}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      certifiedUntil: e.target.value,
                    }))
                  }
                />
              </Grid>

              <Grid size={12}>
                <Box
                    sx={{
                      border: "1px dashed",
                      borderColor: errors.image ? "error.main" : "divider",
                      borderRadius: 2,
                      p: 2.5,
                      bgcolor: "background.default",
                    }}
                  >
                <Stack spacing={1.5} sx={{ alignItems: "flex-start"}}>
                    <Typography variant="subtitle2">Employee Image</Typography>
                  <Button variant="outlined" component="label">
                    Choose Image
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setForm((prev) => ({ ...prev, image: file }));
                      }}
                    />
                  </Button>

                  {form.image && (
                    <>
                      <Typography variant="body2">
                        Selected file: {form.image.name}
                      </Typography>

                      <Box
                        component="img"
                        src={imagePreview}
                        alt="Employee preview"
                        sx={{
                          width: 160,
                          height: 160,
                          objectFit: "cover",
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      />
                    </>
                  )}

                  {errors.image && (
                    <FormHelperText error>{errors.image}</FormHelperText>
                  )}
                </Stack>
                </Box>
              </Grid>

              <Grid size={12}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  sx={{ mt: 2, justifyContent: { xs: "center", sm: "space-between" } }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/employees")}
                  >
                    Back
                  </Button>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <Button
                      variant="outlined"
                      type="button"
                      onClick={handleReset}
                      disabled={submitting}
                    >
                      Reset
                    </Button>

                    <Button
                      variant="contained"
                      type="submit"
                      disabled={submitting}
                      startIcon={
                        submitting ? <CircularProgress size={18} /> : undefined
                      }
                    >
                      Save Employee
                    </Button>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}

export default AddNewEmployee;