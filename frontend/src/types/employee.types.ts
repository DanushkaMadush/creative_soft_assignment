import type { UseFormReturn } from "react-hook-form";
import type { Role } from "./role.types";
import type { FishFarmResponse } from "./fishFarm.types";

export interface Employee {
  id: string;
  fishFarmId: string;
  fishFarmName: string;
  roleId: string;
  roleName: string;
  name: string;
  email: string;
  age: number;
  certifiedUntil: string;
  isActive: boolean;
  imageUrl?: string | null;
}

export interface EmployeeQuery {
  searchTerm?: string;
  fishFarmId?: string;
  roleId?: string;
  isActive?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface EmployeeFormValues {
  fishFarmId: string;
  roleId: string;
  name: string;
  email: string;
  age: string;
  certifiedUntil: string;
  image: File | null;
}

export interface FarmFormValues {
  name: string;
  latitude: string;
  longitude: string;
  numberOfCages: string;
  hasBarge: boolean;
  image: File | null;
}

export type EditEmployeeDialogProps = {
  open: boolean;
  employee: Employee;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (data: EmployeeFormValues) => void | Promise<void>;
};

export type EmployeeFormProps = {
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