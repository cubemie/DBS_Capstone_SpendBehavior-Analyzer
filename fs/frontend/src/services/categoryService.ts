import { apiRequest } from "./apiClient";
import type { ApiCategory } from "../types/models";

export const categoryService = {
  async getCategories(): Promise<ApiCategory[]> {
    return apiRequest<ApiCategory[]>("/categories");
  },

  async createCategory(payload: Omit<ApiCategory, "id">): Promise<ApiCategory> {
    return apiRequest<ApiCategory>("/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
