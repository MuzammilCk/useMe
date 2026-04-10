import { Controller, Get, Post, Body, Query, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "nestjs-zod";
import { ExercisesService } from "./exercises.service";
import { CreateExerciseDto } from "./dto/create-exercise.dto";

@Controller({ path: "exercises", version: "1" })
@UsePipes(ZodValidationPipe)
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get()
  async findAll(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.exercisesService.findAll({ page: pageNum, limit: limitNum });
  }

  @Post()
  async create(@Body() createExerciseDto: CreateExerciseDto) {
    return this.exercisesService.create(createExerciseDto);
  }
}
