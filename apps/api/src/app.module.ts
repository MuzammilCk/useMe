import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ExercisesModule } from './exercises/exercises.module';
import { PlansModule } from './plans/plans.module';
import { ProgressModule } from './progress/progress.module';
import { NutritionModule } from './nutrition/nutrition.module';

@Module({
  imports: [
    ExercisesModule,
    PlansModule,
    ProgressModule,
    NutritionModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
