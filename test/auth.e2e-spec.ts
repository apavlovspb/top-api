import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { disconnect } from 'mongoose';
import { AuthDto } from 'src/auth/dto/auth.dto';

const loginDto: AuthDto = {
  login: 'a@a.ru',
  password: '1',
};

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/login (POST) - success', async (done) => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(200)
      .then(({ body }: request.Response) => {
        token = body.access_token;
        expect(token).toBeDefined();
        done();
      });
  });
  it('/auth/login (POST) - failed', async () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ ...loginDto, password: '123' })
      .expect(401, {
        statusCode: 401,
        message: 'Неверный пароль',
        error: 'Unauthorized',
      });
  });
  it('/auth/login (POST) - failed', async () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ ...loginDto, login: '123@a.ru' })
      .expect(401, {
        statusCode: 401,
        message: 'Пользователь с таким email не найден',
        error: 'Unauthorized',
      });
  });

  afterAll(() => {
    disconnect();
  });
});
