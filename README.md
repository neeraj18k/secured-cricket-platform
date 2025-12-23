# Secure Cricket Platform

A full-stack web application for cricket analytics and management.

## Project Structure

- `backend/`: Node.js + Express API
  - `routes/`: API routes for authentication and cricket data
  - `utils/`: Utility functions like email configuration
  - `server.js`: Main server entry point
- `frontend/`: React + Vite client
  - `src/pages/`: React components for different pages
  - `src/App.jsx`: Main routing logic
  - `src/main.jsx`: React DOM entry point

## Getting Started

### Backend

1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Set up environment variables: Copy `.env.example` to `.env` and fill in your values
4. Start the server: `npm start`

### Frontend

1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Features

- User authentication (signup/login)
- Cricket match and player data management
- Analytics dashboard
- Email notifications

## Technologies Used

- Backend: Node.js, Express.js, Nodemailer
- Frontend: React, Vite, Tailwind CSS
