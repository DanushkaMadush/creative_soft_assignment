import type {
  FishFarmCreateRequest,
  FishFarmQuery,
  PagedResult,
  FishFarmId,
  FishFarmUpdateRequest,
  FishFarmResponse,
} from "../types/fishFarm.types";
import { http } from "./http";

const toFormData = (
  data: FishFarmCreateRequest | FishFarmUpdateRequest,
): FormData => {
  const formData = new FormData();

  formData.append("Name", data.name);
  formData.append("Latitude", String(data.latitude));
  formData.append("Longitude", String(data.longitude));
  formData.append("NumberOfCages", String(data.numberOfCages));
  formData.append("HasBarge", String(data.hasBarge));

  if (data.image) {
    formData.append("Image", data.image);
  }

  return formData;
};

export const fishFarmApi = {
  getAll: async (
    query?: FishFarmQuery,
  ): Promise<PagedResult<FishFarmResponse>> => {
    const res = await http.get("/api/v1/fish-farms", {
      params: query,
    });

    return res.data;
  },

  getById: async (id: FishFarmId): Promise<FishFarmResponse> => {
    const res = await http.get(`/api/v1/fish-farms/${id}`);
    return res.data;
  },

  create: async (data: FishFarmCreateRequest): Promise<FishFarmResponse> => {
    const res = await http.post("/api/v1/fish-farms", toFormData(data));
    return res.data;
  },

  update: async (
    id: FishFarmId,
    data: FishFarmUpdateRequest,
  ): Promise<void> => {
    await http.put(`/api/v1/fish-farms/${id}`, toFormData(data));
  },

  delete: async (id: FishFarmId): Promise<void> => {
    await http.delete(`/api/v1/fish-farms/${id}`);
  },
};
