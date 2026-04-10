import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import {
  exercises,
  plans,
  users,
  userProfiles,
  equipment,
  muscleGroups,
  planDays,
  workoutTemplates,
  workoutExercises,
  progressLogs,
  exerciseLogs,
  exerciseSets,
  nutritionProfiles,
  weightLogs,
  auditLogs,
} from "./schema";

// --- Users ---
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

// --- User Profiles ---
export const insertUserProfileSchema = createInsertSchema(userProfiles);
export const selectUserProfileSchema = createSelectSchema(userProfiles);

// --- Equipment ---
export const insertEquipmentSchema = createInsertSchema(equipment);
export const selectEquipmentSchema = createSelectSchema(equipment);

// --- Muscle Groups ---
export const insertMuscleGroupSchema = createInsertSchema(muscleGroups);
export const selectMuscleGroupSchema = createSelectSchema(muscleGroups);

// --- Exercises ---
export const insertExerciseSchema = createInsertSchema(exercises);
export const selectExerciseSchema = createSelectSchema(exercises);

// --- Plans ---
export const insertPlanSchema = createInsertSchema(plans);
export const selectPlanSchema = createSelectSchema(plans);

// --- Plan Days ---
export const insertPlanDaySchema = createInsertSchema(planDays);
export const selectPlanDaySchema = createSelectSchema(planDays);

// --- Workout Templates ---
export const insertWorkoutTemplateSchema = createInsertSchema(workoutTemplates);
export const selectWorkoutTemplateSchema = createSelectSchema(workoutTemplates);

// --- Workout Exercises ---
export const insertWorkoutExerciseSchema = createInsertSchema(workoutExercises);
export const selectWorkoutExerciseSchema = createSelectSchema(workoutExercises);

// --- Progress Logs ---
export const insertProgressLogSchema = createInsertSchema(progressLogs);
export const selectProgressLogSchema = createSelectSchema(progressLogs);

// --- Exercise Logs ---
export const insertExerciseLogSchema = createInsertSchema(exerciseLogs);
export const selectExerciseLogSchema = createSelectSchema(exerciseLogs);

// --- Exercise Sets ---
export const insertExerciseSetSchema = createInsertSchema(exerciseSets);
export const selectExerciseSetSchema = createSelectSchema(exerciseSets);

// --- Nutrition Profiles ---
export const insertNutritionProfileSchema = createInsertSchema(nutritionProfiles);
export const selectNutritionProfileSchema = createSelectSchema(nutritionProfiles);

// --- Weight Logs ---
export const insertWeightLogSchema = createInsertSchema(weightLogs);
export const selectWeightLogSchema = createSelectSchema(weightLogs);

// --- Audit Logs ---
export const insertAuditLogSchema = createInsertSchema(auditLogs);
export const selectAuditLogSchema = createSelectSchema(auditLogs);
