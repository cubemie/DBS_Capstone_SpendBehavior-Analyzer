import { apiRequest } from "./apiClient";
import type { ApiCategory, CategoryKind } from "../types/models";

export const categoryService = {
  async getCategories(filters: { kind?: CategoryKind } = {}): Promise<ApiCategory[]> {
    const params = new URLSearchParams();
    if (filters.kind) params.set("kind", filters.kind);
    const query = params.toString();

    return apiRequest<ApiCategory[]>(query ? `/categories?${query}` : "/categories");
  },

  async createCategory(payload: Omit<ApiCategory, "id">): Promise<ApiCategory> {
    return apiRequest<ApiCategory>("/categories", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
