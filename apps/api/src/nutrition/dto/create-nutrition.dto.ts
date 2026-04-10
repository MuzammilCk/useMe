import { createZodDto } from "nestjs-zod/dto";
import { insertNutritionProfileSchema } from "@fitness/types";

export class CreateNutritionProfileDto extends createZodDto(insertNutritionProfileSchema) {}
