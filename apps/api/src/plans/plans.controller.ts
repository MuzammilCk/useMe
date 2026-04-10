import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UsePipes,
} from "@nestjs/common";
import { ZodValidationPipe } from "nestjs-zod";
import { PlansService } from "./plans.service";
import { CreatePlanDto, CreatePlanDayDto } from "./dto/create-plan.dto";

@Controller({ path: "plans", version: "1" })
@UsePipes(ZodValidationPipe)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  async findAll(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.plansService.findAll({ page: pageNum, limit: limitNum });
  }

  @Post()
  async create(@Body() createPlanDto: CreatePlanDto) {
    return this.plansService.create(createPlanDto);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.plansService.findOne(id);
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() updateData: any) {
    return this.plansService.update(id, updateData);
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.plansService.remove(id);
  }

  @Get(":id/days")
  async findDays(@Param("id") id: string) {
    return this.plansService.findDays(id);
  }

  @Post(":id/days")
  async createDay(
    @Param("id") id: string,
    @Body() createPlanDayDto: CreatePlanDayDto,
  ) {
    return this.plansService.createDay(id, createPlanDayDto);
  }
}
