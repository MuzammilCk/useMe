import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { exercises, plans, users } from "./schema";

// --- Users ---
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

// --- Exercises ---
export const insertExerciseSchema = createInsertSchema(exercises);
export const selectExerciseSchema = createSelectSchema(exercises);

// --- Plans ---
export const insertPlanSchema = createInsertSchema(plans);
export const selectPlanSchema = createSelectSchema(plans);
