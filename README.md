#  Military Asset Manager

A comprehensive web-based application for managing military assets, personnel, and inventory with real-time tracking and authentication.

[![Live Demo](https://img.shields.io/badge/demo-online-green.svg)](https://military-asset-manager-1.onrender.com/)


##  Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

-  **Secure Authentication** - JWT-based user authentication with bcrypt password hashing
-  **Asset Management** - Track and manage military assets and equipment
-  **User Management** - Role-based access control for different user types
-  **Responsive Design** - Mobile-friendly interface built with React and Tailwind CSS
-  **Real-time Updates** - Live data synchronization across the platform
-  **Firebase Integration** - Enhanced features with Firebase services
-  **CRUD Operations** - Complete create, read, update, and delete functionality
-  **Modern UI** - Clean and intuitive user interface with React Icons

##  Tech Stack

### Frontend
- **React 19** - UI library for building user interfaces
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API requests
- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Icon library
- **React Toastify** - Toast notifications
- **Firebase** - Backend services and authentication
- **Rajdhani Font** - Custom typography

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **CORS** - Cross-Origin Resource Sharing
- **Dotenv** - Environment variable management

##  Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or Atlas account)
- Git

##  Installation

### 1. Clone the repository
```bash
git clone https://github.com/Swaminathanjk/Military-asset-manager.git
cd Military-asset-manager
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

##  Environment Variables

### Backend (.env)
Create a `.env` file in the `backend` directory:

```env
PORT=//YOUR DESIRED PORT
MONGO_URI=// YOUR MONGODB CONNECTION STRING
JWT_SECRET=// YOUR JWT SECRET
```

### Frontend (.env)
Create a `.env` file in the `frontend` directory:

```env
# API Configuration
VITE_BACKEND_URL=https://military-asset-manager.onrender.com/api
```

## 🏃‍♂️ Running the Application

### Development Mode

#### Start Backend Server
```bash
cd backend
npm run dev
```
The backend server will run on `http://localhost:5000`

#### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:5173`

### Production Build

#### Build Frontend
```bash
cd frontend
npm run build
```

#### Start Backend in Production
```bash
cd backend
npm start
```

##  Project Structure

```
Military-asset-manager/
├── backend/
│   ├── controllers/      # Request handlers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── config/           # Configuration files
│   ├── utils/            # Utility functions
│   ├── index.js          # Entry point
│   ├── .env              # environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── context/      # React context
│   │   ├── hooks/        # Custom hooks
│   │   ├── UI/           # UI
│   │   ├── assets/       # Static assets
│   │   ├── App.jsx       # Root component
│   │   └── main.jsx      # Entry point
│   ├── public/
│   ├── index.html
│   ├── .env              # environment variables
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - User login
```

### Users Management
```
GET    /api/users            - Get all users
GET    /api/users/:id        - Get user by ID
POST   /api/users            - Create new user
PUT    /api/users/:id        - Update user
DELETE /api/users/:id        - Delete user
```

### Military Bases
```
GET    /api/bases            - Get all military bases
GET    /api/bases/:id        - Get base by ID
POST   /api/bases            - Create new base
PUT    /api/bases/:id        - Update base
DELETE /api/bases/:id        - Delete base
```

### Asset Types
```
GET    /api/asset-types                 - Get all asset types
GET    /api/asset-types/:id             - Get asset type by ID
POST   /api/asset-types                 - Create new asset type
PUT    /api/asset-types/:id             - Update asset type
DELETE /api/asset-types/:id             - Delete asset type
GET    /api/asset-types/base/:baseId    - Get asset type by base ID
```

### Purchases
```
GET    /api/purchases                   - Get all purchases
GET    /api/purchases/base/:baseId      - Get purchase by base ID
POST   /api/purchases                   - Create new purchase
```

### Assignments
```
GET    /api/assignments      - Get all assignments
GET    /api/assignments/personnel/:serviceId  - Get assignment by personnel service +ID
POST   /api/assignments      - Create new assignment
```

### Transfers
```
GET    /api/transfers        - Get all transfers
GET    /api/transfers/all    - Get transfer by specifications provided in query
POST   /api/transfers        - Create new transfer
```

### Asset Transactions
```
GET    /api/asset-transactions     - Get all transactions
```

### Dashboard
```
GET    /api/dashboard/stats        - Get dashboard statistics
```

##  Features

###  Role-Based Access Control
- Separate user roles for **Admin**, **Officer**, and **Viewer** to ensure secure and restricted access
- **Admins** can manage assets, users, and permissions
- **Officers** can add, update, and track assigned assets
- **Viewers** can view data without modification rights

###  Asset Management
- Full **CRUD** (Create, Read, Update, Delete) functionality for managing military assets
- Each asset entry includes essential details like name, category, status, and assigned personnel
- Search and filter options to quickly locate specific assets

###  Admin Dashboard
- Intuitive dashboard displaying total assets, active assets, and recent updates
- Real-time data fetched from the backend to keep information up to date

###  RESTful API Integration
- Secure and well-structured REST APIs built with **Node.js** and **Express.js**
- Data stored and managed in **MongoDB** for scalability and reliability

###  Secure Authentication
- Uses **JWT (JSON Web Tokens)** for authentication and authorization
- Passwords securely hashed and stored to ensure data privacy

###  Deployment Ready
- Fully deployed and live using **Render**
- Optimized for performance with responsive design and clean UI built using **React.js** and **Material UI**

##  Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


##  Author

**Swaminathan JK**
- GitHub: [@Swaminathanjk](https://github.com/Swaminathanjk)


##  Support

For support, email swaminathanjk@gmail.com or open an issue in the GitHub repository.

---

If you find this project useful, please consider giving it a star on GitHub!
