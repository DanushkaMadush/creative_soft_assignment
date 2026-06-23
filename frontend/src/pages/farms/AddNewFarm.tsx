import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Alert, Box, Container, Paper, Stack, Typography } from "@mui/material";
import type { FishFarmCreateRequest } from "../../types/fishFarm.types";
import { fishFarmApi } from "../../api/fishFarm.api";
import type { FarmFormValues } from "../../types/employee.types";
import FarmForm from "./FarmForm";

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

  const [successMessage, setSuccessMessage] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<FarmFormValues>({
    defaultValues,
    mode: "onBlur",
  });

  const handleReset = () => {
    form.reset(defaultValues);
    setSuccessMessage("");
    setApiError(null);
  };

  const onSubmit = async (data: FarmFormValues) => {
    setApiError(null);
    setSuccessMessage("");

    if (!data.image) {
      form.setError("image", {
        type: "required",
        message: "Farm image is required.",
      });
      return;
    }

    const payload: FishFarmCreateRequest = {
      name: data.name.trim(),
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      numberOfCages: Number(data.numberOfCages),
      hasBarge: data.hasBarge,
      image: data.image,
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

          <FarmForm
            form={form}
            submitText="Create Farm"
            submittingText="Creating..."
            onSubmit={onSubmit}
            onBack={() => navigate("/farms")}
            onReset={handleReset}
          />
        </Stack>
      </Paper>
    </Container>
  );
}

export default AddNewFarm;
