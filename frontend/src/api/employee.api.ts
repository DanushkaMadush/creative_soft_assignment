import type {
  Employee,
  EmployeeQuery,
  PagedResponse,
} from "../types/employee.types";
import { http } from "./http";

export const employeeApi = {
  getAll: async (params?: EmployeeQuery): Promise<PagedResponse<Employee>> => {
    const res = await http.get("/api/v1/employees", {
      params,
    });

    return res.data;
  },

  getById: async (id: string): Promise<Employee> => {
    const res = await http.get(`/api/v1/employees/${id}`);
    return res.data;
  },

  create: async (data: FormData): Promise<Employee> => {
    const res = await http.post("/api/v1/employees", data);
    return res.data;
  },

  update: async (id: string, data: FormData): Promise<void> => {
    await http.put(`/api/v1/employees/${id}`, data);
  },

  delete: async (id: string): Promise<void> => {
    await http.delete(`/api/v1/employees/${id}`);
  },
};
