import { Controller, Get, Post, Put, Body, Param, Query, UsePipes } from "@nestjs/common";
import { ZodValidationPipe } from "nestjs-zod";
import { ExercisesService } from "./exercises.service";
import { CreateExerciseDto } from "./dto/create-exercise.dto";
import { ExerciseQueryDto } from "./dto/exercise-query.dto";

@Controller({ path: "exercises", version: "1" })
@UsePipes(ZodValidationPipe)
export class ExercisesController {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Get()
  async findAll(@Query() query: ExerciseQueryDto) {
    return this.exercisesService.findAll(query);
  }

  @Get(":slug")
  async findOne(@Param("slug") slug: string) {
    return this.exercisesService.findOne(slug);
  }

  @Post()
  async create(@Body() createExerciseDto: CreateExerciseDto) {
    return this.exercisesService.create(createExerciseDto);
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() updateData: any) {
    return this.exercisesService.update(id, updateData);
  }
}
