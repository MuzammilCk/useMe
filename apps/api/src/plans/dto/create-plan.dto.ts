import { createZodDto } from "nestjs-zod/dto";
import { insertPlanSchema, insertPlanDaySchema } from "@fitness/types";

export class CreatePlanDto extends createZodDto(insertPlanSchema) {}
export class CreatePlanDayDto extends createZodDto(insertPlanDaySchema) {}
