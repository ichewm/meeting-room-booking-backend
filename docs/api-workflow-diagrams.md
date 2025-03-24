# 会议室预订系统 API 流程图

本文档提供了会议室预订系统的主要工作流程图，帮助开发者和用户理解系统交互过程。

## 目录
- [用户认证流程](#用户认证流程)
- [会议室预订流程](#会议室预订流程)
- [管理员工作流程](#管理员工作流程)
- [系统架构概览](#系统架构概览)

## 用户认证流程

下图展示了用户注册、登录和认证流程：

```mermaid
sequenceDiagram
    participant U as 用户客户端
    participant A as 认证服务
    participant D as 数据库

    U->>A: 注册请求 /api/auth/register
    A->>D: 检查用户名是否存在
    D-->>A: 返回检查结果
    alt 用户名已存在
        A-->>U: 返回错误：用户名已被占用
    else 用户名可用
        A->>A: 加密密码
        A->>D: 创建新用户
        D-->>A: 用户创建成功
        A-->>U: 返回用户信息（不含密码）
    end

    U->>A: 登录请求 /api/auth/login
    A->>D: 验证用户名和密码
    D-->>A: 返回用户数据
    alt 验证成功
        A->>A: 生成 JWT 令牌
        A-->>U: 返回访问令牌
    else 验证失败
        A-->>U: 返回认证错误
    end

    U->>A: 受保护资源请求 + JWT
    A->>A: 验证 JWT
    alt JWT 有效
        A->>A: 提取用户信息和角色
        A-->>U: 授权访问资源
    else JWT 无效
        A-->>U: 返回认证错误
    end
```

## 会议室预订流程

下图展示了会议室预订的完整流程：

```mermaid
sequenceDiagram
    participant U as 员工用户
    participant R as 预订 API
    participant M as 会议室 API
    participant D as 数据库

    U->>M: 获取可用会议室 GET /rooms
    M->>D: 查询会议室列表
    D-->>M: 返回会议室数据
    M-->>U: 显示可用会议室

    U->>R: 创建预订 POST /reservations
    R->>D: 检查时间冲突
    alt 时间冲突
        D-->>R: 返回冲突信息
        R-->>U: 返回错误：时间冲突
    else 无时间冲突
        R->>D: 创建预订记录
        D-->>R: 预订创建成功
        R-->>U: 返回预订确认
    end

    U->>R: 查看我的预订 GET /reservations
    R->>D: 查询用户预订
    D-->>R: 返回预订列表
    R-->>U: 显示用户预订

    U->>R: 取消预订 DELETE /reservations/{id}
    R->>D: 更新预订状态为取消
    D-->>R: 更新成功
    R-->>U: 返回取消确认
```

## 管理员工作流程

下图展示了管理员管理会议室和用户的流程：

```mermaid
sequenceDiagram
    participant A as 管理员
    participant U as 用户 API
    participant R as 会议室 API
    participant D as 数据库

    A->>U: 查看所有用户 GET /users
    U->>D: 查询用户列表
    D-->>U: 返回用户数据
    U-->>A: 显示用户列表

    A->>U: 修改用户角色 PATCH /users/{id}
    U->>D: 更新用户角色
    D-->>U: 更新成功
    U-->>A: 返回成功消息

    A->>R: 创建新会议室 POST /rooms
    R->>D: 创建会议室记录
    D-->>R: 创建成功
    R-->>A: 返回会议室数据

    A->>R: 修改会议室 PATCH /rooms/{id}
    R->>D: 更新会议室数据
    D-->>R: 更新成功
    R-->>A: 返回更新后的数据

    A->>R: 删除会议室 DELETE /rooms/{id}
    R->>D: 删除会议室记录
    D-->>R: 删除成功
    R-->>A: 返回成功消息
```

## 系统架构概览

下图展示了系统的整体架构和组件关系：

```mermaid
graph TD
    Client[客户端] --> API[API 服务]
    API --> Auth[认证模块]
    API --> Users[用户模块]
    API --> Rooms[会议室模块]
    API --> Reservations[预订模块]
    
    Auth --> DB[(数据库)]
    Users --> DB
    Rooms --> DB
    Reservations --> DB
    
    Auth -.-> JWT[JWT 服务]
    API -.-> Guards[权限守卫]
    Guards -.-> Roles[角色管理]
    
    subgraph 核心服务
        API
        Auth
        JWT
        Guards
        Roles
    end
    
    subgraph 业务模块
        Users
        Rooms
        Reservations
    end
    
    subgraph 数据持久层
        DB
    end
```