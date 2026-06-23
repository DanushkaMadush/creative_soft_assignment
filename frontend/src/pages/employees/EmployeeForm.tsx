import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, type UseFormReturn } from "react-hook-form";
import { useEffect, useState } from "react";

import type { Role } from "../../types/role.types";
import type { FishFarmResponse } from "../../types/fishFarm.types";
import type { EmployeeFormValues } from "../../types/employee.types";

type EmployeeFormProps = {
  form: UseFormReturn<EmployeeFormValues>;
  roles: Role[];
  fishFarms: FishFarmResponse[];
  submitText: string;
  onSubmit: (data: EmployeeFormValues) => void | Promise<void>;
  onBack: () => void;
  onReset?: () => void;
  loading?: boolean;
  defaultImageUrl?: string;
};

const EmployeeForm = ({
  form,
  roles,
  fishFarms,
  submitText,
  onSubmit,
  onBack,
  onReset,
  loading = false,
  defaultImageUrl = "",
}: EmployeeFormProps) => {
  const [imagePreview, setImagePreview] = useState(defaultImageUrl);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const selectedImage = watch("image");
  const isLoading = loading || isSubmitting;

  useEffect(() => {
    setImagePreview(defaultImageUrl);
  }, [defaultImageUrl]);

  const handleImageChange = (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setValue("image", null, { shouldValidate: true });
      setImagePreview("");
      return;
    }

    setValue("image", file, {
      shouldValidate: true,
      shouldDirty: true,
    });

    setImagePreview(URL.createObjectURL(file));
  };

  return (
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
            disabled={isLoading}
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
            disabled={isLoading}
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
            disabled={isLoading}
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
                <Select label="Role" disabled={isLoading} {...field}>
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
                <Select label="Fish Farm" disabled={isLoading} {...field}>
                  {fishFarms.map((farm) => (
                    <MenuItem key={farm.id} value={farm.id}>
                      {farm.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{errors.fishFarmId?.message}</FormHelperText>
              </FormControl>
            )}
          />
        </Grid>

        <Grid size={12}>
          <TextField
            fullWidth
            label="Employee Certified Until"
            type="date"
            disabled={isLoading}
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

              <Button variant="outlined" component="label" disabled={isLoading}>
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
                <Typography variant="body2">
                  Selected file: {selectedImage.name}
                </Typography>
              )}

              {imagePreview && (
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
              )}

              {errors.image && (
                <FormHelperText error>{errors.image.message}</FormHelperText>
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
            <Button variant="outlined" onClick={onBack} disabled={isLoading}>
              Back
            </Button>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              {onReset && (
                <Button
                  variant="outlined"
                  type="button"
                  onClick={onReset}
                  disabled={isLoading}
                >
                  Reset
                </Button>
              )}

              <Button
                variant="contained"
                type="submit"
                disabled={isLoading}
                startIcon={
                  isLoading ? <CircularProgress size={18} /> : undefined
                }
              >
                {submitText}
              </Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeForm;