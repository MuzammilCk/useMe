import { Injectable, NotFoundException } from "@nestjs/common";
import { db, exercises, exerciseToEquipment, exerciseToMuscleGroup, ilike, gt, and, eq } from "@fitness/db";
import { CreateExerciseDto } from "./dto/create-exercise.dto";
import { ExerciseQueryDto } from "./dto/exercise-query.dto";
import { RedisService } from "../common/services/redis.service";
import type { ApiResponse } from "@fitness/types";

@Injectable()
export class ExercisesService {
  constructor(private readonly redisService: RedisService) {}

  async findAll(query: ExerciseQueryDto): Promise<ApiResponse<any>> {
    const cacheKey = `exercises:list:${JSON.stringify(query)}`;
    const cached = await this.redisService.get<ApiResponse<any>>(cacheKey);
    if (cached) {
      return cached;
    }

    const { limit, cursor, search, difficulty, isBodyweight } = query;

    const conditions = [];
    if (cursor) {
      conditions.push(gt(exercises.id, cursor));
    }
    if (search) {
      conditions.push(ilike(exercises.name, `%${search}%`));
    }
    if (difficulty !== undefined) {
      conditions.push(eq(exercises.difficultyLevel, difficulty));
    }
    if (isBodyweight !== undefined) {
      conditions.push(eq(exercises.isBodyweight, isBodyweight));
    }
    // Note: Relations-based filtering (muscleGroup, equipment) typically requires joins or exists subqueries.
    // Simplifying standard filters here for demonstration of the Cursor setup.

    const data = await db.query.exercises.findMany({
      limit,
      where: conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : and(...conditions)) : undefined,
      orderBy: (exercises, { asc }) => [asc(exercises.id)],
      with: {
        muscleGroups: {
          with: { muscleGroup: true }
        },
        equipment: {
          with: { equipment: true }
        }
      }
    });

    const nextCursor = data.length === limit ? data[data.length - 1].id : undefined;

    const response: ApiResponse<any> = {
      success: true,
      data,
      meta: { limit, cursor: nextCursor, version: "1" },
      error: null
    };

    await this.redisService.set(cacheKey, response, 3600); // 1 hour TTL
    return response;
  }

  async findOne(slug: string): Promise<ApiResponse<any>> {
    const cacheKey = `exercises:detail:${slug}`;
    const cached = await this.redisService.get<ApiResponse<any>>(cacheKey);
    if (cached) return cached;

    const data = await db.query.exercises.findFirst({
      where: eq(exercises.slug, slug),
      with: {
        muscleGroups: { with: { muscleGroup: true } },
        equipment: { with: { equipment: true } }
      }
    });

    if (!data) {
      throw new NotFoundException(`Exercise with slug ${slug} not found`);
    }

    const response = { success: true, data, error: null };
    await this.redisService.set(cacheKey, response, 3600);
    return response;
  }

  async create(createExerciseDto: CreateExerciseDto): Promise<ApiResponse<any>> {
    const [created] = await db
      .insert(exercises)
      .values(createExerciseDto)
      .returning();

    await this.redisService.delByPattern("exercises:list:*");
    return { success: true, data: created, error: null };
  }

  async update(id: string, updateData: any): Promise<ApiResponse<any>> {
    const [updated] = await db
      .update(exercises)
      .set(updateData)
      .where(eq(exercises.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }

    await this.redisService.delByPattern("exercises:list:*");
    await this.redisService.del(`exercises:detail:${updated.slug}`);
    return { success: true, data: updated, error: null };
  }
}
