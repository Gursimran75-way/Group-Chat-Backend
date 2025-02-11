# Group Chat Backend

This is a backend service for a **Group Chat Application** built using **Express.js** and **TypeScript**. The backend provides user authentication, group chat management, and message handling via HTTP APIs.

## Features
- **User Authentication** (Signup, Login, Logout, Token Refresh)
- **Group Management** (Create, Update, Delete, Join Public/Private Groups)
- **Message Handling** (Send, Retrieve Messages)
- **Admin Analytics** (User & Group Stats)
- **Rate Limiting** (Protection against API abuse)

## Tech Stack
- **Node.js** & **Express.js**
- **TypeScript**
- **MongoDB** (Mongoose ORM)
- **JWT Authentication**
- **Bcrypt for Password Hashing**
- **Express Rate Limit** (Security)

## Installation

### Prerequisites
Ensure you have the following installed:
- **Node.js** (v16+ recommended)
- **MongoDB**
- **PNPM** (or use npm/yarn)

### Clone the Repository
```sh
git clone https://github.com/yourusername/group-chat-backend.git
cd group-chat-backend
```

### Install Dependencies
```sh
pnpm install
```

### Configure Environment Variables
Create a `.env` file in the root directory and add:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/group-chat
JWT_SECRET=your_secret_key
```

### Run the Server
#### Development Mode:
```sh
pnpm run dev
```

#### Production Mode:
```sh
pnpm run build && pnpm start
```

## API Endpoints

### **Auth Routes**
| Method | Endpoint         | Description        |
|--------|----------------|--------------------|
| POST   | `/auth/signup`  | Register a user   |
| POST   | `/auth/login`   | Login user        |
| POST   | `/auth/logout`  | Logout user       |
| POST   | `/auth/refresh` | Refresh JWT Token |

### **User Routes**
| Method | Endpoint      | Description             |
|--------|--------------|-------------------------|
| GET    | `/users`     | Get all users          |
| GET    | `/users/:id` | Get user by ID         |
| PATCH  | `/users/:id` | Update user details    |
| DELETE | `/users/:id` | Delete user account    |

### **Group Routes**
| Method | Endpoint              | Description                   |
|--------|----------------------|-------------------------------|
| POST   | `/groups`            | Create a new group           |
| GET    | `/groups`            | List all groups              |
| GET    | `/groups/:id`        | Get group details by ID      |
| PATCH  | `/groups/:id`        | Update group information     |
| DELETE | `/groups/:id`        | Delete a group               |
| POST   | `/groups/:id/join`   | Join a public/private group  |

### **Message Routes**
| Method | Endpoint                | Description                |
|--------|------------------------|----------------------------|
| POST   | `/messages/:groupId`   | Send a message to a group  |
| GET    | `/messages/:groupId`   | Get messages for a group   |

## Security Measures
- **JWT Authentication** to protect user data.
- **Rate Limiting** using `express-rate-limit`.
- **Password Hashing** with Bcrypt.

## License
This project is licensed under the **MIT License**.

---

### Contributors
- **Your Name** - [GitHub](https://github.com/yourusername)

---

Happy Coding! 🚀