import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Controller, useForm } from "react-hook-form";
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
import type { EmployeeFormValues } from "../../types/employee.types";

const defaultValues: EmployeeFormValues = {
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

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [fishFarms, setFishFarms] = useState<FishFarmResponse[]>([]);
  const [imagePreview, setImagePreview] = useState("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    defaultValues,
    mode: "onBlur",
  });

  const selectedImage = watch("image");

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const data = await roleApi.getAll();
        setRoles(data);
      } catch {
        setErrorMessage("Failed to load roles. Please try again.");
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
      } catch {
        setErrorMessage("Failed to load fish farms. Please try again.");
      }
    };

    loadFishFarms();
  }, []);

  const handleImageChange = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setValue("image", null, {
        shouldValidate: true,
      });
      setImagePreview("");
      return;
    }

    setValue("image", file, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setImagePreview(URL.createObjectURL(file));
  };

  const handleReset = () => {
    reset(defaultValues);
    setImagePreview("");
    setSuccessMessage("");
    setErrorMessage("");
  };

  const onSubmit = async (data: EmployeeFormValues) => {
    setSuccessMessage("");
    setErrorMessage("");

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
      await employeeApi.create(formData);

      setSuccessMessage("Employee created successfully.");

      setTimeout(() => {
        navigate("/employees");
      }, 800);
    } catch {
      setErrorMessage("Failed to create employee. Please try again.");
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 3 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Add New Employee
            </Typography>
          </Box>

          {successMessage && <Alert severity="success">{successMessage}</Alert>}
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            sx={{ maxWidth: 600, mx: "auto", width: "100%" }}
          >
            <Grid container spacing={2.5}>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Name"
                  error={Boolean(errors.name)}
                  helperText={errors.name?.message}
                  {...register("name", {
                    required: "Name is required.",
                    validate: (value) =>
                      value.trim().length > 0 || "Name is required.",
                  })}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
                  {...register("email", {
                    required: "Email is required.",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address.",
                    },
                  })}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Age"
                  type="number"
                  error={Boolean(errors.age)}
                  helperText={errors.age?.message}
                  slotProps={{
                    htmlInput: { min: 18, max: 100 },
                  }}
                  {...register("age", {
                    required: "Age is required.",
                    validate: (value) => {
                      const ageNumber = Number(value);

                      if (Number.isNaN(ageNumber)) {
                        return "Age must be a valid number.";
                      }

                      if (ageNumber < 18 || ageNumber > 100) {
                        return "Age must be between 18 and 100.";
                      }

                      return true;
                    },
                  })}
                />
              </Grid>

              <Grid size={12}>
                <Controller
                  name="roleId"
                  control={control}
                  rules={{ required: "Role is required." }}
                  render={({ field }) => (
                    <FormControl fullWidth error={Boolean(errors.roleId)}>
                      <InputLabel>Role</InputLabel>
                      <Select label="Role" {...field}>
                        {roles.map((role) => (
                          <MenuItem key={role.id} value={role.id}>
                            {role.name}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>{errors.roleId?.message}</FormHelperText>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid size={12}>
                <Controller
                  name="fishFarmId"
                  control={control}
                  rules={{ required: "Fish farm is required." }}
                  render={({ field }) => (
                    <FormControl fullWidth error={Boolean(errors.fishFarmId)}>
                      <InputLabel>Fish Farm</InputLabel>
                      <Select label="Fish Farm" {...field}>
                        {fishFarms.map((farm) => (
                          <MenuItem key={farm.id} value={farm.id}>
                            {farm.name}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>
                        {errors.fishFarmId?.message}
                      </FormHelperText>
                    </FormControl>
                  )}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label="Employee Certified Until"
                  type="date"
                  error={Boolean(errors.certifiedUntil)}
                  helperText={errors.certifiedUntil?.message}
                  slotProps={{ inputLabel: { shrink: true } }}
                  {...register("certifiedUntil", {
                    required: "Certified until date is required.",
                  })}
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
                  <Stack spacing={1.5} sx={{ alignItems: "flex-start" }}>
                    <Typography variant="subtitle2">Employee Image</Typography>

                    <Button variant="outlined" component="label">
                      Choose Image
                      <input
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleImageChange(e.target.files?.[0] ?? null)
                        }
                      />
                    </Button>

                    <input
                      type="hidden"
                      {...register("image", {
                        validate: (file) => {
                          if (!file) return true;

                          return (
                            file.type.startsWith("image/") ||
                            "Only image files are allowed."
                          );
                        },
                      })}
                    />

                    {selectedImage && (
                      <>
                        <Typography variant="body2">
                          Selected file: {selectedImage.name}
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
                      <FormHelperText error>
                        {errors.image.message}
                      </FormHelperText>
                    )}
                  </Stack>
                </Box>
              </Grid>

              <Grid size={12}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  sx={{
                    mt: 2,
                    justifyContent: { xs: "center", sm: "space-between" },
                  }}
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
                      disabled={isSubmitting}
                    >
                      Reset
                    </Button>

                    <Button
                      variant="contained"
                      type="submit"
                      disabled={isSubmitting}
                      startIcon={
                        isSubmitting ? (
                          <CircularProgress size={18} />
                        ) : undefined
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