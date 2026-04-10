import { createZodDto } from "nestjs-zod/dto";
import { exerciseQuerySchema } from "@fitness/types";

export class ExerciseQueryDto extends createZodDto(exerciseQuerySchema) {}
