import type { UseFormReturn } from "react-hook-form";

export type FishFarmId = string;

export type EmployeeId = string;

export interface FishFarmResponse {
  id: FishFarmId;
  name: string;
  latitude: number;
  longitude: number;
  numberOfCages: number;
  hasBarge: boolean;
  isActive: boolean;
  imageUrl?: string | null;
}

export interface FishFarmQuery {
  searchTerm?: string;
  hasBarge?: boolean;
  isActive?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface FishFarmCreateRequest {
  name: string;
  latitude: number;
  longitude: number;
  numberOfCages: number;
  hasBarge: boolean;
  image: File;
}

export interface FishFarmUpdateRequest {
  name: string;
  latitude: number;
  longitude: number;
  numberOfCages: number;
  hasBarge: boolean;
  image?: File | null;
}

export interface FishFarmEmployeeResponse {
  id: EmployeeId;
  name: string;
  email: string;
  roleName: string;
  certifiedUntil?: string | null;
  isActive: boolean;
  imageUrl?: string | null;
}

export interface FishFarmResponse {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  numberOfCages: number;
  hasBarge: boolean;
  isActive: boolean;
  imageUrl?: string | null;
}

export interface FishFarmQuery {
  searchTerm?: string;
  hasBarge?: boolean;
  isActive?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export  interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export type FilterValue = "all" | "true" | "false";

export type DeleteFarmDialogProps = {
  open: boolean;
  farm: FishFarmResponse;
  loading: boolean;
  error: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export type FarmFormValues = {
  name: string;
  latitude: string;
  longitude: string;
  numberOfCages: string;
  hasBarge: boolean;
  image: File | null;
};

export type FarmFormProps = {
  form: UseFormReturn<FarmFormValues>;
  submitText: string;
  submittingText: string;
  onSubmit: (data: FarmFormValues) => void;
  onBack: () => void;
  onReset?: () => void;
  defaultImageUrl?: string;
};

