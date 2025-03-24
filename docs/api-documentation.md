# 会议室预订系统 API 文档

本文档详细描述了会议室预订系统的 API 端点、请求/响应结构和身份验证要求。

## 目录
- [认证](#认证)
- [用户管理](#用户管理)
- [会议室管理](#会议室管理)
- [预订管理](#预订管理)

## 认证

### 注册新用户
- **URL**: `/api/auth/register`
- **方法**: `POST`
- **描述**: 创建一个新用户账户
- **请求体**:
  ```json
  {
    "username": "string",
    "password": "string",
    "email": "string"
  }
  ```
- **成功响应**: 201 Created
  ```json
  {
    "data": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "employee",
      "createdAt": "2023-06-01T12:00:00Z",
      "updatedAt": "2023-06-01T12:00:00Z"
    },
    "status": "success",
    "timestamp": "2023-06-01T12:00:00Z"
  }
  ```
- **错误响应**: 400 Bad Request (如果请求格式无效)

### 用户登录
- **URL**: `/api/auth/login`
- **方法**: `POST`
- **描述**: 用户登录并获取 JWT 令牌
- **请求体**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **成功响应**: 200 OK
  ```json
  {
    "data": {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "status": "success",
    "timestamp": "2023-06-01T12:05:00Z"
  }
  ```
- **错误响应**: 401 Unauthorized (如果凭据无效)

## 用户管理

### 获取所有用户
- **URL**: `/users`
- **方法**: `GET`
- **描述**: 获取所有用户的列表
- **权限**: 需要管理员权限
- **请求头**: `Authorization: Bearer {jwt_token}`
- **成功响应**: 200 OK
  ```json
  {
    "data": [
      {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "role": "employee",
        "createdAt": "2023-06-01T12:00:00Z",
        "updatedAt": "2023-06-01T12:00:00Z"
      }
    ],
    "status": "success",
    "timestamp": "2023-06-01T12:10:00Z"
  }
  ```

### 获取特定用户
- **URL**: `/users/{id}`
- **方法**: `GET`
- **描述**: 获取特定用户的详细信息
- **权限**: 需要管理员权限或为当前用户
- **请求头**: `Authorization: Bearer {jwt_token}`
- **参数**: `id` - 用户 ID
- **成功响应**: 200 OK
  ```json
  {
    "data": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "employee",
      "createdAt": "2023-06-01T12:00:00Z",
      "updatedAt": "2023-06-01T12:00:00Z"
    },
    "status": "success",
    "timestamp": "2023-06-01T12:15:00Z"
  }
  ```
- **错误响应**: 404 Not Found (如果用户不存在)

### 更新用户
- **URL**: `/users/{id}`
- **方法**: `PATCH`
- **描述**: 更新用户信息
- **权限**: 需要管理员权限或为当前用户
- **请求头**: `Authorization: Bearer {jwt_token}`
- **参数**: `id` - 用户 ID
- **请求体**:
  ```json
  {
    "email": "new.email@example.com"
  }
  ```
- **成功响应**: 200 OK
  ```json
  {
    "data": {
      "id": 1,
      "username": "john_doe",
      "email": "new.email@example.com",
      "role": "employee",
      "createdAt": "2023-06-01T12:00:00Z",
      "updatedAt": "2023-06-01T12:20:00Z"
    },
    "status": "success",
    "timestamp": "2023-06-01T12:20:00Z"
  }
  ```

### 删除用户
- **URL**: `/users/{id}`
- **方法**: `DELETE`
- **描述**: 删除用户
- **权限**: 需要管理员权限
- **请求头**: `Authorization: Bearer {jwt_token}`
- **参数**: `id` - 用户 ID
- **成功响应**: 204 No Content
- **错误响应**: 404 Not Found (如果用户不存在)

## 会议室管理

### 创建会议室
- **URL**: `/rooms`
- **方法**: `POST`
- **描述**: 创建新的会议室
- **权限**: 需要管理员权限
- **请求头**: `Authorization: Bearer {jwt_token}`
- **请求体**:
  ```json
  {
    "name": "大会议室",
    "capacity": 20,
    "location": "3楼西侧",
    "description": "大型会议专用，配备投影设备"
  }
  ```
- **成功响应**: 201 Created
  ```json
  {
    "data": {
      "id": 1,
      "name": "大会议室",
      "capacity": 20,
      "location": "3楼西侧",
      "description": "大型会议专用，配备投影设备",
      "isActive": true,
      "createdAt": "2023-06-01T13:00:00Z",
      "updatedAt": "2023-06-01T13:00:00Z"
    },
    "status": "success",
    "timestamp": "2023-06-01T13:00:00Z"
  }
  ```

### 获取所有会议室
- **URL**: `/rooms`
- **方法**: `GET`
- **描述**: 获取所有会议室的列表
- **权限**: 需要员工或管理员权限
- **请求头**: `Authorization: Bearer {jwt_token}`
- **查询参数**:
  - `page` (可选): 分页页码，默认 1
  - `limit` (可选): 每页项目数，默认 10
  - `status` (可选): 过滤状态 (active/inactive)
- **成功响应**: 200 OK
  ```json
  {
    "data": [
      {
        "id": 1,
        "name": "大会议室",
        "capacity": 20,
        "location": "3楼西侧",
        "description": "大型会议专用，配备投影设备",
        "isActive": true,
        "createdAt": "2023-06-01T13:00:00Z",
        "updatedAt": "2023-06-01T13:00:00Z"
      }
    ],
    "status": "success",
    "timestamp": "2023-06-01T13:05:00Z"
  }
  ```

### 获取特定会议室
- **URL**: `/rooms/{id}`
- **方法**: `GET`
- **描述**: 获取特定会议室的详细信息
- **权限**: 需要员工或管理员权限
- **请求头**: `Authorization: Bearer {jwt_token}`
- **参数**: `id` - 会议室 ID
- **成功响应**: 200 OK
  ```json
  {
    "data": {
      "id": 1,
      "name": "大会议室",
      "capacity": 20,
      "location": "3楼西侧",
      "description": "大型会议专用，配备投影设备",
      "isActive": true,
      "createdAt": "2023-06-01T13:00:00Z",
      "updatedAt": "2023-06-01T13:00:00Z"
    },
    "status": "success",
    "timestamp": "2023-06-01T13:10:00Z"
  }
  ```
- **错误响应**: 404 Not Found (如果会议室不存在)

### 更新会议室
- **URL**: `/rooms/{id}`
- **方法**: `PATCH`
- **描述**: 更新会议室信息
- **权限**: 需要管理员权限
- **请求头**: `Authorization: Bearer {jwt_token}`
- **参数**: `id` - 会议室 ID
- **请求体**:
  ```json
  {
    "name": "更新后的会议室名称",
    "capacity": 25
  }
  ```
- **成功响应**: 200 OK
  ```json
  {
    "data": {
      "id": 1,
      "name": "更新后的会议室名称",
      "capacity": 25,
      "location": "3楼西侧",
      "description": "大型会议专用，配备投影设备",
      "isActive": true,
      "createdAt": "2023-06-01T13:00:00Z",
      "updatedAt": "2023-06-01T13:15:00Z"
    },
    "status": "success",
    "timestamp": "2023-06-01T13:15:00Z"
  }
  ```

### 删除会议室
- **URL**: `/rooms/{id}`
- **方法**: `DELETE`
- **描述**: 删除会议室
- **权限**: 需要管理员权限
- **请求头**: `Authorization: Bearer {jwt_token}`
- **参数**: `id` - 会议室 ID
- **成功响应**: 204 No Content
- **错误响应**: 404 Not Found (如果会议室不存在)

## 预订管理

### 创建预订
- **URL**: `/reservations`
- **方法**: `POST`
- **描述**: 创建新的会议室预订
- **权限**: 需要员工权限
- **请求头**: `Authorization: Bearer {jwt_token}`
- **请求体**:
  ```json
  {
    "startTime": "2023-06-15T09:00:00Z",
    "endTime": "2023-06-15T10:00:00Z",
    "roomId": 1,
    "userId": 1,
    "purpose": "项目启动会议"
  }
  ```
- **成功响应**: 201 Created
  ```json
  {
    "data": {
      "id": 1,
      "startTime": "2023-06-15T09:00:00Z",
      "endTime": "2023-06-15T10:00:00Z",
      "status": "active",
      "purpose": "项目启动会议",
      "userId": 1,
      "roomId": 1,
      "createdAt": "2023-06-01T14:00:00Z",
      "updatedAt": "2023-06-01T14:00:00Z"
    },
    "status": "success",
    "timestamp": "2023-06-01T14:00:00Z"
  }
  ```
- **错误响应**: 400 Bad Request (如果时间冲突或参数无效)

### 获取所有预订
- **URL**: `/reservations`
- **方法**: `GET`
- **描述**: 获取所有预订的列表
- **权限**: 需要员工或管理员权限
- **请求头**: `Authorization: Bearer {jwt_token}`
- **查询参数**:
  - `page` (可选): 分页页码，默认 1
  - `limit` (可选): 每页项目数，默认 10
- **成功响应**: 200 OK
  ```json
  {
    "data": [
      {
        "id": 1,
        "startTime": "2023-06-15T09:00:00Z",
        "endTime": "2023-06-15T10:00:00Z",
        "status": "active",
        "purpose": "项目启动会议",
        "userId": 1,
        "roomId": 1,
        "user": {
          "id": 1,
          "username": "john_doe"
        },
        "room": {
          "id": 1,
          "name": "大会议室"
        },
        "createdAt": "2023-06-01T14:00:00Z",
        "updatedAt": "2023-06-01T14:00:00Z"
      }
    ],
    "status": "success",
    "timestamp": "2023-06-01T14:05:00Z"
  }
  ```

### 获取特定预订
- **URL**: `/reservations/{id}`
- **方法**: `GET`
- **描述**: 获取特定预订的详细信息
- **权限**: 需要员工或管理员权限
- **请求头**: `Authorization: Bearer {jwt_token}`
- **参数**: `id` - 预订 ID
- **成功响应**: 200 OK
  ```json
  {
    "data": {
      "id": 1,
      "startTime": "2023-06-15T09:00:00Z",
      "endTime": "2023-06-15T10:00:00Z",
      "status": "active",
      "purpose": "项目启动会议",
      "userId": 1,
      "roomId": 1,
      "user": {
        "id": 1,
        "username": "john_doe"
      },
      "room": {
        "id": 1,
        "name": "大会议室"
      },
      "createdAt": "2023-06-01T14:00:00Z",
      "updatedAt": "2023-06-01T14:00:00Z"
    },
    "status": "success",
    "timestamp": "2023-06-01T14:10:00Z"
  }
  ```
- **错误响应**: 404 Not Found (如果预订不存在)

### 更新预订
- **URL**: `/reservations/{id}`
- **方法**: `PATCH`
- **描述**: 更新预订信息
- **权限**: 需要员工权限 (限制为预订创建者或管理员)
- **请求头**: `Authorization: Bearer {jwt_token}`
- **参数**: `id` - 预订 ID
- **请求体**:
  ```json
  {
    "startTime": "2023-06-15T09:30:00Z",
    "endTime": "2023-06-15T10:30:00Z",
    "purpose": "更新后的会议目的"
  }
  ```
- **成功响应**: 200 OK
  ```json
  {
    "data": {
      "id": 1,
      "startTime": "2023-06-15T09:30:00Z",
      "endTime": "2023-06-15T10:30:00Z",
      "status": "active",
      "purpose": "更新后的会议目的",
      "userId": 1,
      "roomId": 1,
      "createdAt": "2023-06-01T14:00:00Z",
      "updatedAt": "2023-06-01T14:15:00Z"
    },
    "status": "success",
    "timestamp": "2023-06-01T14:15:00Z"
  }
  ```
- **错误响应**: 
  - 400 Bad Request (如果时间冲突或参数无效)
  - 403 Forbidden (如果用户无权修改此预订)
  - 404 Not Found (如果预订不存在)

### 取消预订
- **URL**: `/reservations/{id}`
- **方法**: `DELETE`
- **描述**: 取消预订
- **权限**: 需要员工权限 (限制为预订创建者或管理员)
- **请求头**: `Authorization: Bearer {jwt_token}`
- **参数**: `id` - 预订 ID
- **成功响应**: 204 No Content
- **错误响应**: 
  - 403 Forbidden (如果用户无权取消此预订)
  - 404 Not Found (如果预订不存在)