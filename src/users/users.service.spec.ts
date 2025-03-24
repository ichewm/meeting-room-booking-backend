import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Role } from '../auth/enums/role.enum';
import { NotFoundException } from '@nestjs/common';

describe('用户服务', () => {
  let service: UsersService;
  let mockUserRepository: {
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    // 初始化 mock，避免使用外部变量
    mockUserRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('应该被定义', () => {
    expect(service).toBeDefined();
  });

  describe('findAll 方法', () => {
    it('应返回用户数组', async () => {
      const expectedUsers = [
        {
          id: 1,
          username: 'test1',
          password: 'password1',
          email: 'test1@example.com',
          role: Role.Employee,
          createdAt: new Date(),
          updatedAt: new Date(),
          reservations: [],
        },
        {
          id: 2,
          username: 'test2',
          password: 'password2',
          email: 'test2@example.com',
          role: Role.Admin,
          createdAt: new Date(),
          updatedAt: new Date(),
          reservations: [],
        },
      ];
      mockUserRepository.find.mockResolvedValue(expectedUsers);

      const result = await service.findAll();
      expect(result).toEqual(expectedUsers);
      expect(mockUserRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne 方法', () => {
    it('应通过用户名返回用户', async () => {
      const username = 'testuser';
      const expectedUser = {
        id: 1,
        username,
        password: 'password123',
        email: 'test@example.com',
        role: Role.Employee,
        createdAt: new Date(),
        updatedAt: new Date(),
        reservations: [],
      };
      mockUserRepository.findOne.mockResolvedValue(expectedUser);

      const result = await service.findOne(username);
      expect(result).toEqual(expectedUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { username },
      });
    });

    it('当用户不存在时应抛出 NotFoundException', async () => {
      const username = 'nonexistent';
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(username)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { username },
      });
    });
  });

  describe('create 方法', () => {
    it('应创建并返回新用户', async () => {
      const createUserDto = {
        username: 'newuser',
        password: 'password123',
        email: 'new@example.com',
      };
      const newUser = {
        id: 1,
        ...createUserDto,
        role: Role.Employee,
        createdAt: new Date(),
        updatedAt: new Date(),
        reservations: [],
      };

      mockUserRepository.create.mockReturnValue(newUser);
      mockUserRepository.save.mockResolvedValue(newUser);

      const result = await service.create(createUserDto);
      expect(result).toEqual(newUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(mockUserRepository.save).toHaveBeenCalledWith(newUser);
    });
  });

  describe('update 方法', () => {
    it('应更新并返回用户', async () => {
      const id = 1;
      const updateUserDto = { email: 'updated@example.com' };
      const existingUser = {
        id,
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
        role: Role.Employee,
        createdAt: new Date(),
        updatedAt: new Date(),
        reservations: [],
      };
      
      const updatedUser = {
        ...existingUser,
        email: 'updated@example.com',
      };

      mockUserRepository.update.mockResolvedValue({ affected: 1 });
      mockUserRepository.findOne.mockResolvedValue(updatedUser);

      const result = await service.update(id, updateUserDto);
      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.update).toHaveBeenCalledWith(id, updateUserDto);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });

  describe('remove 方法', () => {
    it('应删除用户', async () => {
      const id = 1;
      mockUserRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(id);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(id);
    });

    it('当用户不存在时应抛出 NotFoundException', async () => {
      const id = 999;
      mockUserRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(id);
    });
  });
});