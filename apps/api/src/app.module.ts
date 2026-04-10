import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ExercisesModule } from './exercises/exercises.module';
import { PlansModule } from './plans/plans.module';
import { ProgressModule } from './progress/progress.module';
import { NutritionModule } from './nutrition/nutrition.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    CommonModule,
    ExercisesModule,
    PlansModule,
    ProgressModule,
    NutritionModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
