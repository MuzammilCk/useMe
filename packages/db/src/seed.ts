import { faker } from "@faker-js/faker";
import { db } from "./index";
import {
  users,
  userProfiles,
  equipment,
  muscleGroups,
  exercises,
  exerciseToMuscleGroup,
  exerciseToEquipment,
} from "./schema";

async function main() {
  console.log("Starting DB seed...");

  // 1. Clean the database
  console.log("Cleaning database...");
  await db.delete(exerciseToEquipment);
  await db.delete(exerciseToMuscleGroup);
  await db.delete(exercises);
  await db.delete(muscleGroups);
  await db.delete(equipment);
  await db.delete(userProfiles);
  await db.delete(users);

  // 2. Insert standard equipment
  console.log("Inserting equipment...");
  const equipmentData = [
    { name: "Barbell", slug: "barbell", category: "FREE_WEIGHTS" },
    { name: "Dumbbell", slug: "dumbbell", category: "FREE_WEIGHTS" },
    { name: "Kettlebell", slug: "kettlebell", category: "FREE_WEIGHTS" },
    { name: "Pull-up Bar", slug: "pull-up-bar", category: "BODYWEIGHT" },
    { name: "Cable Machine", slug: "cable-machine", category: "MACHINES" },
  ];
  const insertedEquipment = await db.insert(equipment).values(equipmentData).returning();

  // 3. Insert standard muscle groups
  console.log("Inserting muscle groups...");
  const muscleGroupsData = [
    { name: "Chest", slug: "chest", bodyRegion: "UPPER" as const },
    { name: "Back", slug: "back", bodyRegion: "UPPER" as const },
    { name: "Legs", slug: "legs", bodyRegion: "LOWER" as const },
    { name: "Core", slug: "core", bodyRegion: "CORE" as const },
    { name: "Shoulders", slug: "shoulders", bodyRegion: "UPPER" as const },
  ];
  const insertedMuscleGroups = await db.insert(muscleGroups).values(muscleGroupsData).returning();

  // 4. Generate 20 realistic exercises
  console.log("Inserting exercises...");
  const exerciseInserts = Array.from({ length: 20 }).map(() => ({
    name: faker.word.words({ count: { min: 1, max: 3 } }),
    slug: faker.lorem.slug(),
    description: faker.lorem.sentence(),
    instructions: [faker.lorem.sentence(), faker.lorem.sentence()],
    formTips: [faker.lorem.sentence()],
    difficultyLevel: faker.number.int({ min: 1, max: 5 }),
    isBodyweight: faker.datatype.boolean(),
    isUnilateral: faker.datatype.boolean(),
  }));

  const insertedExercises = await db.insert(exercises).values(exerciseInserts).returning();

  // 5. Link exercises to equipment and muscle groups
  console.log("Linking exercises to equipment and muscle groups...");
  for (const ex of insertedExercises) {
    // Random equipment (1 to 2)
    const eqCount = faker.number.int({ min: 1, max: 2 });
    const selectedEqs = faker.helpers.arrayElements(insertedEquipment, eqCount);
    for (const eq of selectedEqs) {
      await db.insert(exerciseToEquipment).values({
        exerciseId: ex.id,
        equipmentId: eq.id,
      });
    }

    // Random muscle groups (1 to 2)
    const mgCount = faker.number.int({ min: 1, max: 2 });
    const selectedMgs = faker.helpers.arrayElements(insertedMuscleGroups, mgCount);
    for (let i = 0; i < selectedMgs.length; i++) {
        await db.insert(exerciseToMuscleGroup).values({
            exerciseId: ex.id,
            muscleGroupId: selectedMgs[i].id,
            isPrimary: i === 0, // First one is primary
        });
    }
  }

  console.log("DB seeding completed successfully.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error during seeding:", err);
  process.exit(1);
});
