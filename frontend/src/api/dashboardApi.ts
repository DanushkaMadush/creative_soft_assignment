import type {
  DashboardTotal,
  FishFarmLocation,
} from "../types/dashboard.types";
import { http } from "./http";

export const dashboardApi = {
  getTotalFishFarms: async (): Promise<DashboardTotal> => {
    const res = await http.get("/api/dashboard/total-fishfarms");
    return res.data;
  },

  getTotalEmployees: async (): Promise<DashboardTotal> => {
    const res = await http.get("/api/dashboard/total-employees");
    return res.data;
  },

  getFishFarmLocations: async (): Promise<FishFarmLocation[]> => {
    const res = await http.get("/api/dashboard/fishfarm-locations");
    return res.data;
  },
};
