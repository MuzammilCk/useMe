import {
  pgTable,
  text,
  timestamp,
  uuid,
  pgEnum,
  integer,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const roleEnum = pgEnum("role", ["USER", "COACH", "ADMIN"]);
export const bodyRegionEnum = pgEnum("body_region", ["UPPER", "LOWER", "CORE", "FULL"]);
export const planStatusEnum = pgEnum("plan_status", ["DRAFT", "ACTIVE", "COMPLETED", "ARCHIVED"]);

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
  days: many(planDays),
}));

// -- Plan Days --
export const planDays = pgTable("plan_days", {
  id: uuid("id").primaryKey().defaultRandom(),
  planId: uuid("plan_id").notNull().references(() => plans.id, { onDelete: "cascade" }),
  dayNumber: integer("day_number").notNull(),
  isRestDay: boolean("is_rest_day").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  deletedAt: timestamp("deleted_at"),
});

export const planDaysRelations = relations(planDays, ({ one }) => ({
  plan: one(plans, { fields: [planDays.planId], references: [plans.id] }),
}));
