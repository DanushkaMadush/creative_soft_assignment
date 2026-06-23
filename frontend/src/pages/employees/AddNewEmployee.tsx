import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Alert, Container, Paper, Stack, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { employeeApi } from "../../api/employee.api";
import { roleApi } from "../../api/role.api";
import { fishFarmApi } from "../../api/fishFarm.api";

import type { Role } from "../../types/role.types";
import type { FishFarmResponse } from "../../types/fishFarm.types";
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

  const [roles, setRoles] = useState<Role[]>([]);
  const [fishFarms, setFishFarms] = useState<FishFarmResponse[]>([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<EmployeeFormValues>({
    defaultValues,
    mode: "onBlur",
  });

  useEffect(() => {
    loadRoles();
    loadFishFarms();
  }, []);

  const loadRoles = async () => {
    try {
      const data = await roleApi.getAll();
      setRoles(data);
    } catch {
      setErrorMessage("Failed to load roles.");
    }
  };

  const loadFishFarms = async () => {
    try {
      const result = await fishFarmApi.getAll({
        isActive: true,
        pageNumber: 1,
        pageSize: 100,
      });

      setFishFarms(result.items);
    } catch {
      setErrorMessage("Failed to load fish farms.");
    }
  };

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

    try {
      await employeeApi.create(formData);

      setSuccessMessage("Employee created successfully.");

      setTimeout(() => {
        navigate("/employees");
      }, 800);
    } catch {
      setErrorMessage("Failed to create employee.");
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 3 }}>
        <Stack spacing={3}>
          <Typography variant="h4" sx={{ fontWegiht: 700}}>
            Add New Employee
          </Typography>

          {successMessage && (
            <Alert severity="success">{successMessage}</Alert>
          )}

          {errorMessage && (
            <Alert severity="error">{errorMessage}</Alert>
          )}

          <EmployeeForm
            form={form}
            roles={roles}
            fishFarms={fishFarms}
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