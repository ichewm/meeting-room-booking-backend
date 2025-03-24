import { cleanupTestDatabase } from './test-config';

// 在所有测试完成后清理数据库
afterAll(async () => {
  cleanupTestDatabase();
});

// 增加测试超时时间
jest.setTimeout(30000);
