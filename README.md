# CodeCollab

A collaborative code sharing platform built with TypeScript, Node.js, and modern web technologies.

## Project Structure

```
codecollab/
├── backend/           # Node.js/TypeScript backend API
│   ├── src/
│   │   └── index.ts   # Main server file
│   ├── package.json
│   └── tsconfig.json
├── frontend/          # Frontend application
├── package.json       # Root package.json for monorepo
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies for all packages:
   ```bash
   npm run install:all
   ```

### Development

#### Backend Development

To start the backend development server:

```bash
npm run dev:backend
```

The backend server will start on `http://localhost:3000` with hot-reloading enabled.

#### Available Scripts

- `npm run dev:backend` - Start backend in development mode
- `npm run build:backend` - Build backend for production
- `npm run dev:frontend` - Start frontend in development mode (once configured)
- `npm run build:frontend` - Build frontend for production (once configured)

## Backend

The backend is built with:

- **Node.js** with **TypeScript**
- **Express.js** for the web framework
- **ts-node-dev** for development hot-reloading

### Backend Scripts

From the `backend/` directory:

- `npm run dev` - Start development server with hot-reloading
- `npm run build` - Compile TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run clean` - Clean build directory

## License

ISC
# codecollab
