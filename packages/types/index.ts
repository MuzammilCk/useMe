import { validations } from "@fitness/db";

// --- Re-export all Zod schemas from the DB layer ---
export const {
  // Users
  insertUserSchema,
  selectUserSchema,
  insertUserProfileSchema,
  selectUserProfileSchema,
  // Equipment & Muscle Groups
  insertEquipmentSchema,
  selectEquipmentSchema,
  insertMuscleGroupSchema,
  selectMuscleGroupSchema,
  // Exercises
  insertExerciseSchema,
  selectExerciseSchema,
  // Plans
  insertPlanSchema,
  selectPlanSchema,
  insertPlanDaySchema,
  selectPlanDaySchema,
  // Workout Templates
  insertWorkoutTemplateSchema,
  selectWorkoutTemplateSchema,
  insertWorkoutExerciseSchema,
  selectWorkoutExerciseSchema,
  // Progress Tracking
  insertProgressLogSchema,
  selectProgressLogSchema,
  insertExerciseLogSchema,
  selectExerciseLogSchema,
  insertExerciseSetSchema,
  selectExerciseSetSchema,
  // Nutrition
  insertNutritionProfileSchema,
  selectNutritionProfileSchema,
  insertWeightLogSchema,
  selectWeightLogSchema,
  // Audit
  insertAuditLogSchema,
  selectAuditLogSchema,
} = validations;

import { z } from "zod";
export { z };

// --- API Response Contract ---
export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
    field?: string;
  } | null;
  meta?: {
    page?: number;
    total?: number;
    version?: string;
  };
}
