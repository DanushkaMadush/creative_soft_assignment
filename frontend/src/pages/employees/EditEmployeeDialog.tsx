import { useEffect, useState } from "react";
import { Alert, Dialog, DialogContent, DialogTitle, Stack } from "@mui/material";
import { useForm } from "react-hook-form";

import { roleApi } from "../../api/role.api";
import { fishFarmApi } from "../../api/fishFarm.api";
import type { Role } from "../../types/role.types";
import type { FishFarmResponse } from "../../types/fishFarm.types";
import type { Employee, EmployeeFormValues } from "../../types/employee.types";
import EmployeeForm from "./EmployeeForm";

const BASE_IMAGE_URL = import.meta.env.VITE_API_BASE_URL;

type EditEmployeeDialogProps = {
  open: boolean;
  employee: Employee;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (data: EmployeeFormValues) => void | Promise<void>;
};

const EditEmployeeDialog = ({
  open,
  employee,
  loading,
  error,
  onClose,
  onSubmit,
}: EditEmployeeDialogProps) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [fishFarms, setFishFarms] = useState<FishFarmResponse[]>([]);
  const [loadError, setLoadError] = useState("");

  const form = useForm<EmployeeFormValues>({
    defaultValues: {
      fishFarmId: "",
      roleId: "",
      name: "",
      email: "",
      age: "",
      certifiedUntil: "",
      image: null,
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      try {
        setLoadError("");

        const [roleData, farmResult] = await Promise.all([
          roleApi.getAll(),
          fishFarmApi.getAll({
            isActive: true,
            pageNumber: 1,
            pageSize: 100,
          }),
        ]);

        setRoles(roleData);
        setFishFarms(farmResult.items);

        const matchedRole = roleData.find(
          (role) => role.name === employee.roleName,
        );

        const matchedFarm = farmResult.items.find(
          (farm) => farm.name === employee.fishFarmName,
        );

        form.reset({
          name: employee.name,
          email: employee.email,
          age: String(employee.age),
          certifiedUntil: employee.certifiedUntil?.split("T")[0] ?? "",
          roleId: employee.roleId ?? matchedRole?.id ?? "",
          fishFarmId: employee.fishFarmId ?? matchedFarm?.id ?? "",
          image: null,
        });
      } catch {
        setLoadError("Failed to load roles or fish farms.");
      }
    };

    loadData();
  }, [open, employee, form]);

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Edit Employee</DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}
          {loadError && <Alert severity="error">{loadError}</Alert>}

          <EmployeeForm
            form={form}
            roles={roles}
            fishFarms={fishFarms}
            submitText="Save Changes"
            loading={loading}
            onSubmit={onSubmit}
            onBack={onClose}
            defaultImageUrl={
              employee.imageUrl
                ? `${BASE_IMAGE_URL}${employee.imageUrl}`
                : undefined
            }
          />
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default EditEmployeeDialog;