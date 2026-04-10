import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  integer,
  boolean,
  uniqueIndex,
  index,
  decimal,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const roleEnum = pgEnum("role", ["USER", "COACH", "ADMIN"]);
export const bodyRegionEnum = pgEnum("body_region", ["UPPER", "LOWER", "CORE", "FULL"]);
export const planStatusEnum = pgEnum("plan_status", ["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"]);
export const fitnessLevelEnum = pgEnum("fitness_level", ["BEGINNER", "INTERMEDIATE", "ADVANCED", "ATHLETE"]);
export const primaryGoalEnum = pgEnum("primary_goal", ["WEIGHT_LOSS", "MUSCLE_GAIN", "ENDURANCE", "MOBILITY", "GENERAL_FITNESS"]);
export const calculationBasisEnum = pgEnum("calculation_basis", ["MIFFLIN", "HARRIS", "CUSTOM"]);

// -- Users --
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  role: roleEnum("role").notNull().default("USER"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles),
  plans: many(plans),
  workoutTemplates: many(workoutTemplates),
  progressLogs: many(progressLogs),
  nutritionProfile: one(nutritionProfiles),
  weightLogs: many(weightLogs),
}));

// -- User Profiles --
export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  fitnessLevel: text("fitness_level"),
  primaryGoal: text("primary_goal"),
  hasInjuries: boolean("has_injuries").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, { fields: [userProfiles.userId], references: [users.id] }),
}));

// -- Equipment --
export const equipment = pgTable("equipment", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const equipmentRelations = relations(equipment, ({ many }) => ({
  exercises: many(exerciseToEquipment),
}));

// -- Muscle Groups --
export const muscleGroups = pgTable("muscle_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  bodyRegion: bodyRegionEnum("body_region").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const muscleGroupsRelations = relations(muscleGroups, ({ many }) => ({
  exercises: many(exerciseToMuscleGroup),
}));

// -- Exercises --
export const exercises = pgTable("exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  instructions: text("instructions").array(),
  formTips: text("form_tips").array(),
  difficultyLevel: integer("difficulty_level").notNull(), // 1-5
  isBodyweight: boolean("is_bodyweight").notNull().default(false),
  isUnilateral: boolean("is_unilateral").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
}, (table) => {
  return {
    // Generate an index to support text searching via ILIKE locally or more optimally if migrating to tsquery
    nameSearchIdx: index("exercises_name_search_idx").on(table.name),
  };
});

export const exercisesRelations = relations(exercises, ({ many }) => ({
  muscleGroups: many(exerciseToMuscleGroup),
  equipment: many(exerciseToEquipment),
}));

// -- Junction tables --
export const exerciseToMuscleGroup = pgTable("exercise_to_muscle_group", {
  id: uuid("id").primaryKey().defaultRandom(),
  exerciseId: uuid("exercise_id").notNull().references(() => exercises.id, { onDelete: "cascade" }),
  muscleGroupId: uuid("muscle_group_id").notNull().references(() => muscleGroups.id, { onDelete: "cascade" }),
  isPrimary: boolean("is_primary").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const exerciseToMuscleGroupRelations = relations(exerciseToMuscleGroup, ({ one }) => ({
  exercise: one(exercises, { fields: [exerciseToMuscleGroup.exerciseId], references: [exercises.id] }),
  muscleGroup: one(muscleGroups, { fields: [exerciseToMuscleGroup.muscleGroupId], references: [muscleGroups.id] }),
}));

export const exerciseToEquipment = pgTable("exercise_to_equipment", {
  id: uuid("id").primaryKey().defaultRandom(),
  exerciseId: uuid("exercise_id").notNull().references(() => exercises.id, { onDelete: "cascade" }),
  equipmentId: uuid("equipment_id").notNull().references(() => equipment.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const exerciseToEquipmentRelations = relations(exerciseToEquipment, ({ one }) => ({
  exercise: one(exercises, { fields: [exerciseToEquipment.exerciseId], references: [exercises.id] }),
  equipment: one(equipment, { fields: [exerciseToEquipment.equipmentId], references: [equipment.id] }),
}));

// -- Plans --
export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  status: planStatusEnum("status").notNull().default("DRAFT"),
  startDate: timestamp("start_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const plansRelations = relations(plans, ({ one, many }) => ({
  user: one(users, { fields: [plans.userId], references: [users.id] }),
  progressLogs: many(progressLogs),
  days: many(planDays),
}));

// -- Plan Days --
export const planDays = pgTable("plan_days", {
  id: uuid("id").primaryKey().defaultRandom(),
  planId: uuid("plan_id").notNull().references(() => plans.id, { onDelete: "cascade" }),
  dayNumber: integer("day_number").notNull(),
  isRestDay: boolean("is_rest_day").notNull().default(false),
  title: text("title"),
  notes: text("notes"),
  workoutTemplateId: uuid("workout_template_id").references(() => workoutTemplates.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const planDaysRelations = relations(planDays, ({ one, many }) => ({
  plan: one(plans, { fields: [planDays.planId], references: [plans.id] }),
  workoutTemplate: one(workoutTemplates, { fields: [planDays.workoutTemplateId], references: [workoutTemplates.id] }),
  progressLogs: many(progressLogs),
}));

// -- Workout Templates --
export const workoutTemplates = pgTable("workout_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  createdByUserId: uuid("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
  isPublic: boolean("is_public").notNull().default(false),
  totalDurationMinutes: integer("total_duration_minutes"),
  difficultyLevel: integer("difficulty_level"),
  warmupIncluded: boolean("warmup_included").notNull().default(false),
  cooldownIncluded: boolean("cooldown_included").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const workoutTemplatesRelations = relations(workoutTemplates, ({ one, many }) => ({
  createdBy: one(users, { fields: [workoutTemplates.createdByUserId], references: [users.id] }),
  exercises: many(workoutExercises),
  planDays: many(planDays),
}));

// -- Workout Exercises (ordered list within a template) --
export const workoutExercises = pgTable("workout_exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  workoutTemplateId: uuid("workout_template_id").notNull().references(() => workoutTemplates.id, { onDelete: "cascade" }),
  exerciseId: uuid("exercise_id").notNull().references(() => exercises.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull(),
  sets: integer("sets").notNull().default(3),
  repsMin: integer("reps_min"),
  repsMax: integer("reps_max"),
  durationSeconds: integer("duration_seconds"),
  restSeconds: integer("rest_seconds").notNull().default(60),
  intensityNote: text("intensity_note"),
  isOptional: boolean("is_optional").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const workoutExercisesRelations = relations(workoutExercises, ({ one }) => ({
  workoutTemplate: one(workoutTemplates, { fields: [workoutExercises.workoutTemplateId], references: [workoutTemplates.id] }),
  exercise: one(exercises, { fields: [workoutExercises.exerciseId], references: [exercises.id] }),
}));

// -- Progress Logs --
export const progressLogs = pgTable("progress_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  planDayId: uuid("plan_day_id").references(() => planDays.id, { onDelete: "set null" }),
  workoutTemplateId: uuid("workout_template_id").references(() => workoutTemplates.id, { onDelete: "set null" }),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
  totalDurationMinutes: integer("total_duration_minutes"),
  perceivedExertion: integer("perceived_exertion"), // 1-10
  fatigueLevel: integer("fatigue_level"), // 1-10
  painNotes: text("pain_notes"),
  generalNotes: text("general_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const progressLogsRelations = relations(progressLogs, ({ one, many }) => ({
  user: one(users, { fields: [progressLogs.userId], references: [users.id] }),
  planDay: one(planDays, { fields: [progressLogs.planDayId], references: [planDays.id] }),
  workoutTemplate: one(workoutTemplates, { fields: [progressLogs.workoutTemplateId], references: [workoutTemplates.id] }),
  exerciseLogs: many(exerciseLogs),
}));

// -- Exercise Logs --
export const exerciseLogs = pgTable("exercise_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  progressLogId: uuid("progress_log_id").notNull().references(() => progressLogs.id, { onDelete: "cascade" }),
  exerciseId: uuid("exercise_id").notNull().references(() => exercises.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const exerciseLogsRelations = relations(exerciseLogs, ({ one, many }) => ({
  progressLog: one(progressLogs, { fields: [exerciseLogs.progressLogId], references: [progressLogs.id] }),
  exercise: one(exercises, { fields: [exerciseLogs.exerciseId], references: [exercises.id] }),
  sets: many(exerciseSets),
}));

// -- Exercise Sets --
export const exerciseSets = pgTable("exercise_sets", {
  id: uuid("id").primaryKey().defaultRandom(),
  exerciseLogId: uuid("exercise_log_id").notNull().references(() => exerciseLogs.id, { onDelete: "cascade" }),
  setNumber: integer("set_number").notNull(),
  reps: integer("reps"),
  weightKg: decimal("weight_kg", { precision: 6, scale: 2 }),
  durationSeconds: integer("duration_seconds"),
  isWarmup: boolean("is_warmup").notNull().default(false),
  rpe: integer("rpe"), // 1-10
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const exerciseSetsRelations = relations(exerciseSets, ({ one }) => ({
  exerciseLog: one(exerciseLogs, { fields: [exerciseSets.exerciseLogId], references: [exerciseLogs.id] }),
}));

// -- Nutrition Profiles --
export const nutritionProfiles = pgTable("nutrition_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  targetCalories: integer("target_calories"),
  targetProteinG: decimal("target_protein_g", { precision: 6, scale: 2 }),
  targetCarbsG: decimal("target_carbs_g", { precision: 6, scale: 2 }),
  targetFatG: decimal("target_fat_g", { precision: 6, scale: 2 }),
  hydrationTargetMl: integer("hydration_target_ml"),
  calculationBasis: calculationBasisEnum("calculation_basis").notNull().default("MIFFLIN"),
  activityMultiplier: decimal("activity_multiplier", { precision: 4, scale: 2 }),
  lastCalculatedAt: timestamp("last_calculated_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const nutritionProfilesRelations = relations(nutritionProfiles, ({ one }) => ({
  user: one(users, { fields: [nutritionProfiles.userId], references: [users.id] }),
}));

// -- Weight Logs --
export const weightLogs = pgTable("weight_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  weightKg: decimal("weight_kg", { precision: 6, scale: 2 }).notNull(),
  bodyFatPercentage: decimal("body_fat_percentage", { precision: 5, scale: 2 }),
  measuredAt: timestamp("measured_at").notNull().defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const weightLogsRelations = relations(weightLogs, ({ one }) => ({
  user: one(users, { fields: [weightLogs.userId], references: [users.id] }),
}));

// -- Audit Logs --
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id"),
  metadata: jsonb("metadata"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));
