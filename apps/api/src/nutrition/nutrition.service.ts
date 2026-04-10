import { Injectable } from "@nestjs/common";
import type { ApiResponse } from "@fitness/types";

@Injectable()
export class NutritionService {
  async getProfile(userId: string): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: {
        id: "mock-uuid",
        userId,
        targetCalories: 2500,
        targetProteinG: "180.00",
        targetCarbsG: "250.00",
        targetFatG: "80.00",
        calculationBasis: "MIFFLIN",
      },
      error: null,
    };
  }

  async createProfile(data: any): Promise<ApiResponse<any>> {
    return {
      success: true,
      data: { id: "mock-uuid", ...data },
      error: null,
    };
  }
}
