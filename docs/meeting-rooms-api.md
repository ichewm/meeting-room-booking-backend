# 会议室 API 文档

## 概述

会议室 API 提供了对会议室资源的管理功能，包括创建、查询、更新和删除会议室，以及特定的状态管理和可用性查询功能。

## 身份验证

所有 API 端点都需要 JWT 身份验证。请在请求头中包含以下内容：

```
Authorization: Bearer <your_jwt_token>
```

## 权限控制

API 使用基于角色的访问控制：
- `Admin`: 可以执行所有操作
- `Employee`: 可以查询会议室信息和可用性

## 基本端点

### 获取会议室列表

**GET /rooms**

查询所有会议室，支持分页和按状态筛选。

**查询参数**:
- `page` (number, 可选): 页码，必须是正整数，默认为 1
- `limit` (number, 可选): 每页记录数，必须是正整数，默认为 10
- `status` (string, 可选): 会议室状态，可选值: "available", "occupied", "maintenance"

**响��**:
```json
{
  "items": [
    {
      "id": 1,
      "name": "会议室 A",
      "capacity": 10,
      "location": "一楼",
      "description": "带投影仪的小型会议室",
      "status": "available",
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

### 获取可用会议室

**GET /rooms/available**

查询在指定时间段内可用的会议室。

**查询参数**:
- `startTime` (ISO datetime string, 必填): 起始时间
- `endTime` (ISO datetime string, 必填): 结束时间
- `capacity` (number, 可选): 最小容量要求，必须是非负整数

**响应**:
```json
[
  {
    "id": 1,
    "name": "会议室 A",
    "capacity": 10,
    "location": "一楼",
    "description": "带投影仪的小型会议室",
    "status": "available",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
]
```

### 获取单个会议室

**GET /rooms/:id**

获取特定 ID 的会议室详细信息。

**路径参数**:
- `id` (number): 会议室 ID

**响应**:
```json
{
  "id": 1,
  "name": "会议室 A",
  "capacity": 10,
  "location": "一楼",
  "description": "带投影仪的小型会议室",
  "status": "available",
  "isActive": true,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z",
  "reservations": []
}
```

## 管理端点（仅限管理员）

### 创建会议室

**POST /rooms**

创建新的会议室。

**请求体**:
```json
{
  "name": "会议室 B",
  "capacity": 20,
  "location": "二楼",
  "description": "大型会议室，配备视频会议系统"
}
```

**响应**:
```json
{
  "id": 2,
  "name": "会议室 B",
  "capacity": 20,
  "location": "二楼",
  "description": "大型会议室，配备视频会议系统",
  "status": "available",
  "isActive": true,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### 更新会议室

**PATCH /rooms/:id**

更新指定 ID 的会议室信息。

**路径参数**:
- `id` (number): 会议室 ID

**请求体**:
```json
{
  "name": "会议室 B（已更新）",
  "capacity": 25,
  "description": "大型会议室，新增白板设备"
}
```

**响应**:
```json
{
  "id": 2,
  "name": "会议室 B（已更新）",
  "capacity": 25,
  "location": "二楼",
  "description": "大型会议室，新增白板设备",
  "status": "available",
  "isActive": true,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-02T00:00:00.000Z"
}
```

### 更新会议室状态

**PATCH /rooms/:id/status**

更新指定 ID 的会议室状态。

**路径参数**:
- `id` (number): 会议室 ID

**请求体**:
```json
{
  "status": "maintenance"
}
```

**响应**:
```json
{
  "id": 2,
  "name": "会议室 B",
  "capacity": 25,
  "location": "二楼",
  "description": "大型会议室，新增白板设备",
  "status": "maintenance",
  "isActive": true,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-03T00:00:00.000Z"
}
```

### 删除会议室

**DELETE /rooms/:id**

软删除指定 ID 的会议室（将 isActive 设置为 false）。

**路径参数**:
- `id` (number): 会议室 ID

**响应**:
状态码 200 表示删除成功。

## 状态枚举值

会议室状态有以下可选值：

| 值 | 描述 |
|---|---|
| `available` | 会议室可用 |
| `occupied` | 会议室已被占用 |
| `maintenance` | 会议室处于维护状态 |

## 错误处理

API 返回标准的 HTTP 状态码和错误消息：

- `400 Bad Request`: 请求参数无效（例如分页参数不是数字）
- `401 Unauthorized`: 未提供有效的认证凭证
- `403 Forbidden`: 没有执行请求操作的权限
- `404 Not Found`: 请求的资源不存在
- `500 Internal Server Error`: 服务器内部错误