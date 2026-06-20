import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
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

interface FarmFormState {
  name: string;
  latitude: string;
  longitude: string;
  numberOfCages: string;
  hasBarge: boolean;
  image: File | null;
}

interface FarmFormErrors {
  name?: string;
  latitude?: string;
  longitude?: string;
  numberOfCages?: string;
  image?: string;
}

const initialFormState: FarmFormState = {
  name: "",
  latitude: "",
  longitude: "",
  numberOfCages: "",
  hasBarge: false,
  image: null,
};

function AddNewFarm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FarmFormState>(initialFormState);
  const [errors, setErrors] = useState<FarmFormErrors>({});
  const [imagePreview, setImagePreview] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FarmFormErrors = {};

    const latitude = Number(formData.latitude);
    const longitude = Number(formData.longitude);
    const numberOfCages = Number(formData.numberOfCages);

    if (!formData.name.trim()) {
      newErrors.name = "Farm name is required.";
    }

    if (!formData.latitude) {
      newErrors.latitude = "Latitude is required.";
    } else if (Number.isNaN(latitude) || latitude < -90 || latitude > 90) {
      newErrors.latitude = "Latitude must be between -90 and 90.";
    }

    if (!formData.longitude) {
      newErrors.longitude = "Longitude is required.";
    } else if (Number.isNaN(longitude) || longitude < -180 || longitude > 180) {
      newErrors.longitude = "Longitude must be between -180 and 180.";
    }

    if (!formData.numberOfCages) {
      newErrors.numberOfCages = "Number of cages is required.";
    } else if (
      Number.isNaN(numberOfCages) ||
      !Number.isInteger(numberOfCages) ||
      numberOfCages <= 0
    ) {
      newErrors.numberOfCages = "Number of cages must be greater than 0.";
    }

    if (!formData.image) {
      newErrors.image = "Farm image is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTextChange =
    (field: keyof Omit<FarmFormState, "hasBarge" | "image">) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));

      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    };

  const handleBargeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      hasBarge: event.target.checked,
    }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setFormData((prev) => ({
        ...prev,
        image: null,
      }));
      setImagePreview("");
      setErrors((prev) => ({
        ...prev,
        image: "Only image files are allowed.",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      image: selectedFile,
    }));

    setErrors((prev) => ({
      ...prev,
      image: undefined,
    }));

    setImagePreview(URL.createObjectURL(selectedFile));
  };

  const handleReset = () => {
    setFormData(initialFormState);
    setErrors({});
    setImagePreview("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError(null);
    setSuccessMessage("");

    if (!validateForm()) return;

    const payload: FishFarmCreateRequest = {
      name: formData.name.trim(),
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      numberOfCages: Number(formData.numberOfCages),
      hasBarge: formData.hasBarge,
      image: formData.image!,
    };

    try {
      setLoading(true);

      await fishFarmApi.create(payload);

      setSuccessMessage("Farm created successfully.");

      setTimeout(() => {
        navigate("/farms");
      }, 800);
    } catch (err) {
      console.error(err);
      setError("Failed to create farm.");
    } finally {
      setLoading(false);
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
          {error && <Alert severity="error">{error}</Alert>}

          <Box
            component="form"
            onSubmit={handleSubmit}
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
                    value={formData.name}
                    onChange={handleTextChange("name")}
                    error={Boolean(errors.name)}
                    helperText={errors.name}
                    required
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    type="number"
                    value={formData.latitude}
                    onChange={handleTextChange("latitude")}
                    error={Boolean(errors.latitude)}
                    helperText={errors.latitude}
                    required
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    type="number"
                    value={formData.longitude}
                    onChange={handleTextChange("longitude")}
                    error={Boolean(errors.longitude)}
                    helperText={errors.longitude}
                    required
                  />
                </Grid>

                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Number of Cages"
                    type="number"
                    value={formData.numberOfCages}
                    onChange={handleTextChange("numberOfCages")}
                    error={Boolean(errors.numberOfCages)}
                    helperText={errors.numberOfCages}
                    required
                    slotProps={{
                      htmlInput: { min: 1, step: 1 },
                    }}
                  />
                </Grid>

                <Grid size={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.hasBarge}
                        onChange={handleBargeChange}
                      />
                    }
                    label="Barge"
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
                          onChange={handleImageChange}
                        />
                      </Button>

                      {formData.image && (
                        <Typography variant="body2" color="text.secondary">
                          Selected file: {formData.image.name}
                        </Typography>
                      )}

                      {errors.image && (
                        <Typography variant="caption" color="error">
                          {errors.image}
                        </Typography>
                      )}

                      {imagePreview && (
                        <Box
                          component="img"
                          src={imagePreview}
                          alt="Selected farm preview"
                          sx={{
                            width: "100%",
                            maxHeight: 260,
                            objectFit: "cover",
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            mt: 1,
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
                  <Button type="submit" variant="contained" disabled={loading}>
                    {loading ? "Creating..." : "Create Farm"}
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
