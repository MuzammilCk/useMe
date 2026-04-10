import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UsePipes,
} from "@nestjs/common";
import { ZodValidationPipe } from "nestjs-zod";
import { NutritionService } from "./nutrition.service";
import { CreateNutritionProfileDto } from "./dto/create-nutrition.dto";

@Controller({ path: "nutrition", version: "1" })
@UsePipes(ZodValidationPipe)
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Get("profile")
  async getProfile(@Query("userId") userId: string) {
    return this.nutritionService.getProfile(userId);
  }

  @Post("profile")
  async createProfile(@Body() createProfileDto: CreateNutritionProfileDto) {
    return this.nutritionService.createProfile(createProfileDto);
  }
}
