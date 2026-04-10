import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('ExercisesController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableVersioning({
      type: VersioningType.URI,
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/v1/exercises (POST) - fails validation', () => {
    return request(app.getHttpServer())
      .post('/v1/exercises')
      .send({
        // Missing required fields like name, slug, difficultyLevel
      })
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toBe('Validation failed'); // nested nestjs-zod errors
      });
  });

  it('/v1/exercises (POST) - succeeds', () => {
    return request(app.getHttpServer())
      .post('/v1/exercises')
      .send({
        name: 'Test Exercise',
        slug: 'test-exercise-' + Date.now(),
        difficultyLevel: 2,
        isBodyweight: true,
        isUnilateral: false,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.name).toBe('Test Exercise');
        expect(res.body.id).toBeDefined();
      });
  });

  it('/v1/exercises (GET) - succeeds', () => {
    return request(app.getHttpServer())
      .get('/v1/exercises?page=1&limit=5')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});
