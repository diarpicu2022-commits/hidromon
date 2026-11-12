import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

// Requiere Postgres arriba (docker compose up -d) y el .env configurado.
describe('HidroMon API (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  it('/zonas (GET) devuelve la lista con su conteo', () => {
    return request(app.getHttpServer())
      .get('/zonas')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.count).toBe(res.body.data.length);
      });
  });

  it('/sensores/abc (GET) responde 400 por el id no numérico', () => {
    return request(app.getHttpServer()).get('/sensores/abc').expect(400);
  });

  afterEach(async () => {
    await app.close();
  });
});
