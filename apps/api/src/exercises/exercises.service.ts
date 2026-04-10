import { Injectable } from "@nestjs/common";
import { db, exercises, exerciseToEquipment, exerciseToMuscleGroup } from "@fitness/db";
import { CreateExerciseDto } from "./dto/create-exercise.dto";

@Injectable()
export class ExercisesService {
  async findAll({ page = 1, limit = 10 }: { page?: number; limit?: number }) {
    const offset = (page - 1) * limit;

    const data = await db.query.exercises.findMany({
      limit,
      offset,
      with: {
        muscleGroups: {
          with: { muscleGroup: true }
        },
        equipment: {
          with: { equipment: true }
        }
      }
    });

    return data;
  }

  async create(createExerciseDto: CreateExerciseDto) {
    const [created] = await db
      .insert(exercises)
      .values(createExerciseDto)
      .returning();

    return created;
  }
}
