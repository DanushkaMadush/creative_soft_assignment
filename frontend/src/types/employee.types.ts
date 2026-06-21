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