import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UsePipes,
} from "@nestjs/common";
import { ZodValidationPipe } from "nestjs-zod";
import { ProgressService } from "./progress.service";
import { CreateProgressLogDto } from "./dto/create-progress.dto";

@Controller({ path: "progress", version: "1" })
@UsePipes(ZodValidationPipe)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  async findAll(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.progressService.findAll({ page: pageNum, limit: limitNum });
  }

  @Post()
  async create(@Body() createProgressDto: CreateProgressLogDto) {
    return this.progressService.create(createProgressDto);
  }
}
