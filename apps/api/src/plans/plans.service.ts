import { Injectable } from "@nestjs/common";
import type { ApiResponse } from "@fitness/types";

@Injectable()
export class PlansService {
  async findAll(params: { page: number; limit: number }): Promise<ApiResponse<any[]>> {
    return {
      success: true,
      data: [],
      error: null,
      meta: { page: params.page, total: 0, version: "1.0" },
    };
  }

  async findOne(id: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { id, title: "Mock Plan", status: "DRAFT" },
      error: null,
    };
  }

  async create(data: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { id: "mock-uuid", ...data },
      error: null,
    };
  }

  async update(id: string, data: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { id, ...data },
      error: null,
    };
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    return {
      success: true,
      data: null,
      error: null,
    };
  }

  async findDays(planId: string): Promise<ApiResponse<any[]>> {
    return {
      success: true,
      data: [],
      error: null,
      meta: { total: 0, version: "1.0" },
    };
  }

  async createDay(planId: string, data: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { id: "mock-day-uuid", planId, ...data },
      error: null,
    };
  }
}
