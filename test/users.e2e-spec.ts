import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { testDbConfig } from './test-config';
import { CreateUserDto } from '../src/users/dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from '../src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from '../src/auth/enums/role.enum';
import { createAdminUser, generateTestToken } from './test-utils';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let userRepository: Repository<User>;
  let adminToken: string;
  let adminUser: User;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(testDbConfig), AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    jwtService = app.get<JwtService>(JwtService);
    userRepository = app.get<Repository<User>>(getRepositoryToken(User));

    await app.init();

    // 创建管理员用户并生成令牌
    adminUser = await createAdminUser(userRepository);
    adminToken = generateTestToken(adminUser, jwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users', () => {
    it('should create a new user', () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
      };

      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createUserDto)
        .expect(201)
        .then((response) => {
          expect(response.body).toBeDefined();
          expect(response.body.username).toEqual(createUserDto.username);
          expect(response.body.email).toEqual(createUserDto.email);
          expect(response.body.password).toBeUndefined(); // 密码不应该返回
        });
    });

    it('should validate user input', () => {
      const invalidDto = {
        username: 'test',
        password: '123', // 太短
        email: 'invalid-email', // 无效的邮箱格式
      };

      return request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /users', () => {
    it('should return all users for admin', () => {
      return request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .then((response) => {
          expect(Array.isArray(response.body)).toBeTruthy();
          expect(response.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('GET /users/:id', () => {
    it('should return user by id', () => {
      return request(app.getHttpServer())
        .get(`/users/${adminUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .then((response) => {
          expect(response.body).toBeDefined();
          expect(response.body.id).toEqual(adminUser.id);
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/9999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update user', () => {
      const updateData = {
        email: 'updated@example.com',
      };

      return request(app.getHttpServer())
        .patch(`/users/${adminUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200)
        .then((response) => {
          expect(response.body).toBeDefined();
          expect(response.body.email).toEqual(updateData.email);
        });
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user', async () => {
      // 先创建一个用户，然后删除它
      const createUserDto: CreateUserDto = {
        username: 'user-to-delete',
        password: 'password123',
        email: 'delete@example.com',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createUserDto)
        .expect(201);

      const userId = createResponse.body.id;

      return request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });
  });
});
