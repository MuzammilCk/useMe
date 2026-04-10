import { validations } from "@fitness/db";

export const {
  insertExerciseSchema,
  selectExerciseSchema,
  insertPlanSchema,
  selectPlanSchema,
  insertUserSchema,
  selectUserSchema,
} = validations;

import { z } from "zod";
export { z };
