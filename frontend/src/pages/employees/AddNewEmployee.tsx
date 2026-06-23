import { useState } from "react";
import { useNavigate } from "react-router";
import { Alert, Container, Paper, Stack, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeeApi } from "../../api/employee.api";
import { roleApi } from "../../api/role.api";
import { fishFarmApi } from "../../api/fishFarm.api";

import type { EmployeeFormValues } from "../../types/employee.types";
import EmployeeForm from "./EmployeeForm";

const defaultValues: EmployeeFormValues = {
  fishFarmId: "",
  roleId: "",
  name: "",
  email: "",
  age: "",
  certifiedUntil: "",
  image: null,
};

export default function AddNewEmployee() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<EmployeeFormValues>({
    defaultValues,
    mode: "onBlur",
  });

  const rolesQuery = useQuery({
    queryKey: ["roles"],
    queryFn: roleApi.getAll,
  });

  const fishFarmsQuery = useQuery({
    queryKey: ["fish-farms", "active"],
    queryFn: () =>
      fishFarmApi.getAll({
        isActive: true,
        pageNumber: 1,
        pageSize: 100,
      }),
  });

  const createEmployeeMutation = useMutation({
    mutationFn: employeeApi.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["employees"] });

      setSuccessMessage("Employee created successfully.");

      setTimeout(() => {
        navigate("/employees");
      }, 800);
    },
    onError: () => {
      setErrorMessage("Failed to create employee.");
    },
  });

  const handleReset = () => {
    form.reset(defaultValues);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleSubmit = async (data: EmployeeFormValues) => {
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

    createEmployeeMutation.mutate(formData);
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 3 }}>
        <Stack spacing={3}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Add New Employee
          </Typography>

          {successMessage && <Alert severity="success">{successMessage}</Alert>}

          {(errorMessage || rolesQuery.isError || fishFarmsQuery.isError) && (
            <Alert severity="error">
              {errorMessage ||
                "Failed to load roles or fish farms."}
            </Alert>
          )}

          <EmployeeForm
            form={form}
            roles={rolesQuery.data ?? []}
            fishFarms={fishFarmsQuery.data?.items ?? []}
            submitText="Save Employee"
            onSubmit={handleSubmit}
            onBack={() => navigate("/employees")}
            onReset={handleReset}
          />
        </Stack>
      </Paper>
    </Container>
  );
}