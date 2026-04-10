import { createZodDto } from "nestjs-zod/dto";
import { insertProgressLogSchema } from "@fitness/types";

export class CreateProgressLogDto extends createZodDto(insertProgressLogSchema) {}
