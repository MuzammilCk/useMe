import { createZodDto } from "nestjs-zod/dto";
import { insertExerciseSchema } from "@fitness/types";

export class CreateExerciseDto extends createZodDto(insertExerciseSchema) {}
