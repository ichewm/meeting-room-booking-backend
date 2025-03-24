import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MeetingRoomsService } from './meeting-rooms.service';
import { MeetingRoom } from './entities/meeting-room.entity';
import { NotFoundException } from '@nestjs/common';

describe('会议室服务', () => {
  let service: MeetingRoomsService;
  let mockMeetingRoomRepository: {
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const mockMeetingRooms = [
    {
      id: 1,
      name: '大会议室',
      capacity: 20,
      location: '3楼西侧',
      description: '大型会议专用',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      reservations: [],
    },
    {
      id: 2,
      name: '小会议室',
      capacity: 8,
      location: '2楼东侧',
      description: '小型讨论用',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      reservations: [],
    },
  ];

  beforeEach(async () => {
    mockMeetingRoomRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingRoomsService,
        {
          provide: getRepositoryToken(MeetingRoom),
          useValue: mockMeetingRoomRepository,
        },
      ],
    }).compile();

    service = module.get<MeetingRoomsService>(MeetingRoomsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll 方法', () => {
    it('应返回会议室列表（带分页）', async () => {
      mockMeetingRoomRepository.find.mockResolvedValue(mockMeetingRooms);

      const result = await service.findAll({
        page: 1,
        limit: 10,
      });

      expect(mockMeetingRoomRepository.find).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {},
      });
      expect(result).toEqual(mockMeetingRooms);
    });

    it('应根据状态过滤会议室', async () => {
      mockMeetingRoomRepository.find.mockResolvedValue([mockMeetingRooms[0]]);

      const result = await service.findAll({
        status: 'active',
      });

      expect(mockMeetingRoomRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
      });
      expect(result).toEqual([mockMeetingRooms[0]]);
    });
  });

  describe('findOne 方法', () => {
    it('当找到会议室时应返回会议室信息', async () => {
      mockMeetingRoomRepository.findOne.mockResolvedValue(mockMeetingRooms[0]);

      const result = await service.findOne(1);

      expect(mockMeetingRoomRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockMeetingRooms[0]);
    });

    it('当会议室不存在时应抛出 NotFoundException', async () => {
      mockMeetingRoomRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockMeetingRoomRepository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });
  });

  describe('create 方法', () => {
    it('应创建并返回新会议室', async () => {
      const createRoomDto = {
        name: '新会议室',
        capacity: 15,
        location: '1楼中部',
        description: '中型会议室',
      };

      const newRoom = {
        id: 3,
        ...createRoomDto,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        reservations: [],
      };

      mockMeetingRoomRepository.create.mockReturnValue(newRoom);
      mockMeetingRoomRepository.save.mockResolvedValue(newRoom);

      const result = await service.create(createRoomDto);

      expect(mockMeetingRoomRepository.create).toHaveBeenCalledWith(
        createRoomDto,
      );
      expect(mockMeetingRoomRepository.save).toHaveBeenCalledWith(newRoom);
      expect(result).toEqual(newRoom);
    });
  });

  describe('update 方法', () => {
    it('应更新并返回会议室信息', async () => {
      const updateRoomDto = {
        name: '更新的会议室',
        capacity: 25,
      };

      const updatedRoom = {
        ...mockMeetingRooms[0],
        ...updateRoomDto,
      };

      mockMeetingRoomRepository.update.mockResolvedValue({ affected: 1 });
      mockMeetingRoomRepository.findOne.mockResolvedValue(updatedRoom);

      const result = await service.update(1, updateRoomDto);

      expect(mockMeetingRoomRepository.update).toHaveBeenCalledWith(
        1,
        updateRoomDto,
      );
      expect(mockMeetingRoomRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(updatedRoom);
    });

    it('当会议室不存在时应抛出 NotFoundException', async () => {
      const updateRoomDto = {
        name: '更新的会议室',
      };

      mockMeetingRoomRepository.update.mockResolvedValue({ affected: 0 });

      await expect(service.update(999, updateRoomDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockMeetingRoomRepository.update).toHaveBeenCalledWith(
        999,
        updateRoomDto,
      );
    });
  });

  describe('remove 方法', () => {
    it('当会议室存在时应删除会议室', async () => {
      mockMeetingRoomRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(mockMeetingRoomRepository.delete).toHaveBeenCalledWith(1);
    });

    it('当会议室不存在时应抛出 NotFoundException', async () => {
      mockMeetingRoomRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockMeetingRoomRepository.delete).toHaveBeenCalledWith(999);
    });
  });
});
