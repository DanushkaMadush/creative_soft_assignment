import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Box,
  Button,
  Container,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import type { FishFarmCreateRequest } from "../../types/fishFarm.types";
import { fishFarmApi } from "../../api/fishFarm.api";

interface FarmFormValues {
  name: string;
  latitude: string;
  longitude: string;
  numberOfCages: string;
  hasBarge: boolean;
  image: File | null;
}

const defaultValues: FarmFormValues = {
  name: "",
  latitude: "",
  longitude: "",
  numberOfCages: "",
  hasBarge: false,
  image: null,
};

function AddNewFarm() {
  const navigate = useNavigate();

  const [imagePreview, setImagePreview] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FarmFormValues>({
    defaultValues,
    mode: "onBlur",
  });

  const selectedImage = watch("image");

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
    setApiError(null);
  };

  const onSubmit = async (data: FarmFormValues) => {
    setApiError(null);
    setSuccessMessage("");

    const payload: FishFarmCreateRequest = {
      name: data.name.trim(),
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      numberOfCages: Number(data.numberOfCages),
      hasBarge: data.hasBarge,
      image: data.image!,
    };

    try {
      await fishFarmApi.create(payload);

      setSuccessMessage("Farm created successfully.");

      setTimeout(() => {
        navigate("/farms");
      }, 800);
    } catch (err) {
      console.error(err);
      setApiError("Failed to create farm.");
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2.5, sm: 4 },
          borderRadius: 3,
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
              Add New Farm
            </Typography>
          </Box>

          {successMessage && <Alert severity="success">{successMessage}</Alert>}
          {apiError && <Alert severity="error">{apiError}</Alert>}

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            sx={{
              maxWidth: 600,
              mx: "auto",
              width: "100%",
            }}
          >
            <Stack spacing={3}>
              <Grid container spacing={2.5}>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    required
                    error={Boolean(errors.name)}
                    helperText={errors.name?.message}
                    {...register("name", {
                      required: "Farm name is required.",
                      validate: (value) =>
                        value.trim().length > 0 || "Farm name is required.",
                    })}
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    type="number"
                    required
                    error={Boolean(errors.latitude)}
                    helperText={errors.latitude?.message}
                    {...register("latitude", {
                      required: "Latitude is required.",
                      validate: (value) => {
                        const numberValue = Number(value);

                        if (Number.isNaN(numberValue)) {
                          return "Latitude must be a valid number.";
                        }

                        if (numberValue < -90 || numberValue > 90) {
                          return "Latitude must be between -90 and 90.";
                        }

                        return true;
                      },
                    })}
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    type="number"
                    required
                    error={Boolean(errors.longitude)}
                    helperText={errors.longitude?.message}
                    {...register("longitude", {
                      required: "Longitude is required.",
                      validate: (value) => {
                        const numberValue = Number(value);

                        if (Number.isNaN(numberValue)) {
                          return "Longitude must be a valid number.";
                        }

                        if (numberValue < -180 || numberValue > 180) {
                          return "Longitude must be between -180 and 180.";
                        }

                        return true;
                      },
                    })}
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Number of Cages"
                    type="number"
                    required
                    error={Boolean(errors.numberOfCages)}
                    helperText={errors.numberOfCages?.message}
                    slotProps={{
                      htmlInput: { min: 1, step: 1 },
                    }}
                    {...register("numberOfCages", {
                      required: "Number of cages is required.",
                      validate: (value) => {
                        const numberValue = Number(value);

                        if (Number.isNaN(numberValue)) {
                          return "Number of cages must be a valid number.";
                        }

                        if (!Number.isInteger(numberValue) || numberValue <= 0) {
                          return "Number of cages must be greater than 0.";
                        }

                        return true;
                      },
                    })}
                  />
                </Grid>

                <Grid size={12}>
                  <Controller
                    name="hasBarge"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.value}
                            onChange={(_, checked) => field.onChange(checked)}
                          />
                        }
                        label="Barge"
                      />
                    )}
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
                      <Typography variant="subtitle2">Farm Image</Typography>

                      <Button variant="outlined" component="label">
                        Choose Image
                        <input
                          hidden
                          type="file"
                          accept="image/*"
                          onChange={(event) =>
                            handleImageChange(event.target.files?.[0] ?? null)
                          }
                        />
                      </Button>

                      <input
                        type="hidden"
                        {...register("image", {
                          required: "Farm image is required.",
                        })}
                      />

                      {selectedImage && (
                        <Typography variant="body2" color="text.secondary">
                          Selected file: {selectedImage.name}
                        </Typography>
                      )}

                      {errors.image && (
                        <Typography variant="caption" color="error">
                          {errors.image.message}
                        </Typography>
                      )}

                      {imagePreview && (
                        <Box
                          component="img"
                          src={imagePreview}
                          alt="Selected farm preview"
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
                    </Stack>
                  </Box>
                </Grid>
              </Grid>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{ justifyContent: "space-between" }}
              >
                <Button variant="outlined" onClick={() => navigate("/farms")}>
                  Back
                </Button>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button variant="text" onClick={handleReset}>
                    Reset
                  </Button>

                  <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Farm"}
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}

export default AddNewFarm;