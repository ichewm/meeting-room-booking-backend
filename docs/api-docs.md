# Meeting Room Booking System API Documentation

## Overview
This API serves the meeting room booking system, allowing users to manage meeting rooms, reservations, and user accounts with different permission levels.

## Authentication

### Login
- **Endpoint**: `POST /auth/login`
- **Description**: Authenticate a user and get JWT token
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "accessToken": "jwt_token",
    "user": {
      "id": "number",
      "username": "string",
      "email": "string",
      "role": "string"
    }
  }
  ```

## User Management

### Get All Users
- **Endpoint**: `GET /users`
- **Description**: Fetch all users
- **Required Role**: Admin, SuperAdmin
- **Authorization**: JWT Bearer Token
- **Response**: Array of user objects

### Get User by ID
- **Endpoint**: `GET /users/:id`
- **Description**: Fetch a specific user by ID
- **Required Role**: Admin, SuperAdmin
- **Authorization**: JWT Bearer Token
- **Response**: User object

### Create User
- **Endpoint**: `POST /users`
- **Description**: Create a new user
- **Required Role**: Admin, SuperAdmin
- **Authorization**: JWT Bearer Token
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string",
    "email": "string",
    "role": "employee" // default role
  }
  ```
- **Response**: Created user object

### Update User
- **Endpoint**: `PATCH /users/:id`
- **Description**: Update a user's information
- **Required Role**: Admin, SuperAdmin
- **Authorization**: JWT Bearer Token
- **Request Body**:
  ```json
  {
    "username": "string",
    "email": "string"
  }
  ```
- **Response**: Updated user object

### Delete User
- **Endpoint**: `DELETE /users/:id`
- **Description**: Delete a user
- **Required Role**: Admin, SuperAdmin
- **Authorization**: JWT Bearer Token
- **Notes**: 
  - SuperAdmin users cannot be deleted
  - Only SuperAdmin can delete Admin users

### Get Current User Roles and Permissions
- **Endpoint**: `GET /users/me/roles`
- **Description**: Get the current user's role and permissions
- **Authorization**: JWT Bearer Token
- **Response**:
  ```json
  {
    "role": "string",
    "permissions": {
      "canManageAdmins": "boolean",
      "canManageUsers": "boolean"
    }
  }
  ```

## Role Management

### Set User Role
- **Endpoint**: `PATCH /users/:id/role`
- **Description**: Change a user's role
- **Required Role**: SuperAdmin
- **Authorization**: JWT Bearer Token
- **Request Body**:
  ```json
  {
    "role": "admin" // or "employee"
  }
  ```
- **Response**: Updated user object
- **Permissions**:
  - Only SuperAdmin can assign SuperAdmin role
  - Only SuperAdmin can modify Admin roles
  - Admin users cannot create other Admin users

### Remove Admin Role
- **Endpoint**: `DELETE /users/:id/admin-role`
- **Description**: Remove admin privileges from a user
- **Required Role**: SuperAdmin
- **Authorization**: JWT Bearer Token
- **Response**: Updated user object
- **Permissions**:
  - Only SuperAdmin can remove Admin roles

## Meeting Room Management

### Get All Meeting Rooms
- **Endpoint**: `GET /meeting-rooms`
- **Description**: Fetch all meeting rooms
- **Authorization**: JWT Bearer Token
- **Response**: Array of meeting room objects

### Get Meeting Room by ID
- **Endpoint**: `GET /meeting-rooms/:id`
- **Description**: Fetch a specific meeting room by ID
- **Authorization**: JWT Bearer Token
- **Response**: Meeting room object

### Create Meeting Room
- **Endpoint**: `POST /meeting-rooms`
- **Description**: Create a new meeting room
- **Required Role**: Admin, SuperAdmin
- **Authorization**: JWT Bearer Token
- **Request Body**:
  ```json
  {
    "name": "string",
    "capacity": "number",
    "location": "string",
    "amenities": "string[]"
  }
  ```
- **Response**: Created meeting room object

### Update Meeting Room
- **Endpoint**: `PATCH /meeting-rooms/:id`
- **Description**: Update a meeting room's information
- **Required Role**: Admin, SuperAdmin
- **Authorization**: JWT Bearer Token
- **Request Body**:
  ```json
  {
    "name": "string",
    "capacity": "number",
    "location": "string",
    "amenities": "string[]"
  }
  ```
- **Response**: Updated meeting room object

### Delete Meeting Room
- **Endpoint**: `DELETE /meeting-rooms/:id`
- **Description**: Delete a meeting room
- **Required Role**: Admin, SuperAdmin
- **Authorization**: JWT Bearer Token

## Reservation Management

### Get All Reservations
- **Endpoint**: `GET /reservations`
- **Description**: Fetch all reservations
- **Required Role**: Admin, SuperAdmin
- **Authorization**: JWT Bearer Token
- **Response**: Array of reservation objects

### Get User Reservations
- **Endpoint**: `GET /reservations/user`
- **Description**: Fetch reservations for the current user
- **Authorization**: JWT Bearer Token
- **Response**: Array of reservation objects

### Get Reservation by ID
- **Endpoint**: `GET /reservations/:id`
- **Description**: Fetch a specific reservation by ID
- **Authorization**: JWT Bearer Token
- **Response**: Reservation object

### Create Reservation
- **Endpoint**: `POST /reservations`
- **Description**: Create a new reservation
- **Authorization**: JWT Bearer Token
- **Request Body**:
  ```json
  {
    "meetingRoomId": "number",
    "startTime": "datetime",
    "endTime": "datetime",
    "purpose": "string"
  }
  ```
- **Response**: Created reservation object

### Update Reservation
- **Endpoint**: `PATCH /reservations/:id`
- **Description**: Update a reservation
- **Authorization**: JWT Bearer Token
- **Request Body**:
  ```json
  {
    "startTime": "datetime",
    "endTime": "datetime",
    "purpose": "string"
  }
  ```
- **Response**: Updated reservation object

### Delete Reservation
- **Endpoint**: `DELETE /reservations/:id`
- **Description**: Delete a reservation
- **Authorization**: JWT Bearer Token