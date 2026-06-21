import type { Role, RoleCreateRequest } from "../types/role.types";
import { http } from "./http";

export const roleApi = {
  getAll: async (): Promise<Role[]> => {
    const res = await http.get("/api/v1/roles");
    return res.data;
  },

  create: async (data: RoleCreateRequest): Promise<Role> => {
    const res = await http.post("/api/v1/roles", data);
    return res.data;
  },
};
