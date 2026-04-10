import { Injectable } from "@nestjs/common";
import type { ApiResponse } from "@fitness/types";

@Injectable()
export class ProgressService {
  async findAll(params: { page: number; limit: number }): Promise<ApiResponse<any[]>> {
    return {
      success: true,
      data: [],
      error: null,
      meta: { page: params.page, total: 0, version: "1.0" },
    };
  }

  async create(data: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { id: "mock-uuid", ...data },
      error: null,
    };
  }
}
