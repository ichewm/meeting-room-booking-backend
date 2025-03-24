import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from './enums/role.enum';

// 模拟 bcrypt
jest.mock('bcrypt');

describe('认证服务', () => {
  let service: AuthService;
  // 注意：这里我们明确使用了这些变量，避免未使用警告
  let mockUsersService: { findOne: jest.Mock; create: jest.Mock };
  let mockJwtService: { sign: jest.Mock };

  beforeEach(async () => {
    // 重新初始化 mock 服务，避免使用外部变量
    mockUsersService = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('应该被定义', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser 方法', () => {
    it('当凭证有效时应返回用户对象', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        password: 'hashedPassword',
        email: 'test@example.com',
        role: Role.Employee,
        createdAt: new Date(),
        updatedAt: new Date(),
        reservations: [],
      };

      mockUsersService.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('testuser', 'password123');

      expect(result).toEqual({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: Role.Employee,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        reservations: [],
      });
      expect(mockUsersService.findOne).toHaveBeenCalledWith('testuser');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword',
      );
    });

    it('当用户不存在时应返回 null', async () => {
      mockUsersService.findOne.mockRejectedValue(new Error('User not found'));

      const result = await service.validateUser('nonexistent', 'password123');

      expect(result).toBeNull();
    });

    it('当密码无效时应返回 null', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        password: 'hashedPassword',
        email: 'test@example.com',
        role: Role.Employee,
        createdAt: new Date(),
        updatedAt: new Date(),
        reservations: [],
      };

      mockUsersService.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('testuser', 'wrongpassword');

      expect(result).toBeNull();
    });
  });

  describe('login 方法', () => {
    it('应为用户生成 JWT 令牌', async () => {
      const user = {
        id: 1,
        username: 'testuser',
        role: Role.Employee,
      };

      const token = 'generated.jwt.token';
      mockJwtService.sign.mockReturnValue(token);

      const result = await service.login(user);

      expect(result).toEqual({ access_token: token });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        username: user.username,
        sub: user.id,
        role: user.role,
      });
    });
  });

  describe('register 方法', () => {
    it('应哈希密码并创建新用户', async () => {
      const createUserDto = {
        username: 'newuser',
        password: 'password123',
        email: 'new@example.com',
      };

      const hashedPassword = 'hashedPassword123';
      const createdUser = {
        id: 1,
        username: 'newuser',
        password: hashedPassword,
        email: 'new@example.com',
        role: Role.Employee,
        createdAt: new Date(),
        updatedAt: new Date(),
        reservations: [],
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await service.register(createUserDto);

      expect(result).toEqual(createdUser);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
      expect(mockUsersService.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: hashedPassword,
      });
    });
  });
});