# 会议室预订系统API文档

## 概述
本API服务于会议室预订系统，允许用户管理会议室、预订以及具有不同权限级别的用户账户。

## 认证

### 登录
- **接口**: `POST /auth/login`
- **描述**: 认证用户并获取JWT令牌
- **请求体**:
  ```json
  {
    "username": "用户名",
    "password": "密码"
  }
  ```
- **响应**:
  ```json
  {
    "accessToken": "jwt令牌",
    "user": {
      "id": "数字",
      "username": "用户名",
      "email": "邮箱",
      "role": "角色"
    }
  }
  ```

## 用户管理

### 获取所有用户
- **接口**: `GET /users`
- **描述**: 获取所有用户
- **所需角色**: 管理员，超级管理员
- **授权**: JWT Bearer Token
- **响应**: 用户对象数组

### 通过ID获取用户
- **接口**: `GET /users/:id`
- **描述**: 通过ID获取特定用户
- **所需角色**: 管理员，超级管理员
- **授权**: JWT Bearer Token
- **响应**: 用户对象

### 创建用户
- **接口**: `POST /users`
- **描述**: 创建新用户
- **所需角色**: 管理员，超级管理员
- **授权**: JWT Bearer Token
- **请求体**:
  ```json
  {
    "username": "用户名",
    "password": "密码",
    "email": "邮箱",
    "role": "employee" // 默认角色
  }
  ```
- **响应**: 创建的用户对象

### 更新用户
- **接口**: `PATCH /users/:id`
- **描述**: 更新用户信息
- **所需角色**: 管理员，超级管理员
- **授权**: JWT Bearer Token
- **请求体**:
  ```json
  {
    "username": "用户名",
    "email": "邮箱"
  }
  ```
- **响应**: 更新后的用户对象

### 删除用户
- **接口**: `DELETE /users/:id`
- **描述**: 删除用户
- **所需角色**: 管理员，超级管理员
- **授权**: JWT Bearer Token
- **注意**: 
  - 超级管理员用户不能被删除
  - 只有超级管理员可以删除管理员用户

### 获取当前用户角色和权限
- **接口**: `GET /users/me/roles`
- **描述**: 获取当前用户的角色和权限
- **授权**: JWT Bearer Token
- **响应**:
  ```json
  {
    "role": "角色",
    "permissions": {
      "canManageAdmins": "布尔值",
      "canManageUsers": "布尔值"
    }
  }
  ```

## 角色管理

### 设置用户角色
- **接口**: `PATCH /users/:id/role`
- **描述**: 更改用户角色
- **所需角色**: 超级管理员
- **授权**: JWT Bearer Token
- **请求体**:
  ```json
  {
    "role": "admin" // 或 "employee"
  }
  ```
- **响应**: 更新后的用户对象
- **权限**:
  - 只有超级管理员可以分配超级管理员角色
  - 只有超级管理员可以修改管理员角色
  - 管理员用户不能创建其他管理员用户

### 移除管理员角色
- **接口**: `DELETE /users/:id/admin-role`
- **描述**: 从用户移除管理员权限
- **所需角色**: 超级管理员
- **授权**: JWT Bearer Token
- **响应**: 更新后的用户对象
- **权限**:
  - 只有超级管理员可以移除管理员角色

## 会议室管理

### 获取所有会议室
- **接口**: `GET /rooms`
- **描述**: 获取所有会议室
- **授权**: JWT Bearer Token
- **响应**: 会议室对象数组

### 通过ID获取会议室
- **接口**: `GET /rooms/:id`
- **描述**: 通过ID获取特定会议室
- **授权**: JWT Bearer Token
- **响应**: 会议室对象

### 创建会议室
- **接口**: `POST /rooms`
- **描述**: 创建新会议室
- **所需角色**: 管理员，超级管理员
- **授权**: JWT Bearer Token
- **请求体**:
  ```json
  {
    "name": "名称",
    "capacity": "容量",
    "location": "位置",
    "description": "设施数组"
  }
  ```
- **响应**: 创建的会议室对象

### 更新会议室
- **接口**: `PATCH /rooms/:id`
- **描述**: 更新会议室信息
- **所需角色**: 管理员，超级管理员
- **授权**: JWT Bearer Token
- **请求体**:
  ```json
  {
    "name": "名称",
    "capacity": "容量",
    "location": "位置",
    "description": "设施数组"
  }
  ```
- **响应**: 更新后的会议室对象

### 删除会议室
- **接口**: `DELETE /rooms/:id`
- **描述**: 删除会议室
- **所需角色**: 管理员，超级管理员
- **授权**: JWT Bearer Token

## 预订管理

### 获取所有预订
- **接口**: `GET /reservations`
- **描述**: 获取所有预订
- **所需角色**: 管理员，超级管理员
- **授权**: JWT Bearer Token
- **响应**: 预订对象数组

### 获取用户预订
- **接口**: `GET /reservations/user`
- **描述**: 获取当前用户的预订
- **授权**: JWT Bearer Token
- **响应**: 预订对象数组

### 通过ID获取预订
- **接口**: `GET /reservations/:id`
- **描述**: 通过ID获取特定预订
- **授权**: JWT Bearer Token
- **响应**: 预订对象

### 创建预订
- **接口**: `POST /reservations`
- **描述**: 创建新预订
- **授权**: JWT Bearer Token
- **请求体**:
  ```json
  {
    "meetingRoomId": "会议室ID",
    "startTime": "开始时间",
    "endTime": "结束时间",
    "purpose": "用途"
  }
  ```
- **响应**: 创建的预订对象

### 更新预订
- **接口**: `PATCH /reservations/:id`
- **描述**: 更新预订
- **授权**: JWT Bearer Token
- **请求体**:
  ```json
  {
    "startTime": "开始时间",
    "endTime": "结束时间",
    "purpose": "用途"
  }
  ```
- **响应**: 更新后的预订对象

### 删除预订
- **接口**: `DELETE /reservations/:id`
- **描述**: 删除预订
- **授权**: JWT Bearer Token