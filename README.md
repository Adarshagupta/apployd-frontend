# Neon UI

This is the frontend user interface for the Neon distributed serverless PostgreSQL system.

## Prerequisites

- Node.js (v16+)
- PostgreSQL (local instance for development)
- Docker and Docker Compose (for running the Neon backend services)

## Getting Started

### Option 1: Start Everything at Once (Recommended)

This script will start both the Neon backend services and the UI:

```bash
# Make the script executable if needed
chmod +x start-full-stack.sh

# Run the full-stack script
./start-full-stack.sh
```

This script will:
1. Check if the Neon backend is already running
2. Start the backend if needed (pageserver, compute, safekeepers, etc.)
3. Start the Express server for user/database management
4. Start the Vite development server for the UI
5. Run a service check to verify everything is connected

### Option 2: Restart UI Only (After Backend is Already Running)

If you already have the Neon backend services running and just want to restart the UI:

```bash
# Make the script executable if needed
chmod +x restart-ui.sh

# Restart just the UI components
./restart-ui.sh
```

### Option 3: Check Service Status

To check if all required services are running:

```bash
# Make the script executable if needed
chmod +x check-services.sh

# Run the status check
./check-services.sh
```

## Default Ports

- UI (Vite dev server): 5173 (falls back to 5174, 5175, 5176 if in use)
- API Server (Express): 3081
- Neon Compute: 3080
- Neon Pageserver: 9898
- PostgreSQL (local): 5432
- PostgreSQL (Neon): 55433

## Default Users

The application comes with two predefined users:

1. Admin User
   - Email: admin@neondb.io
   - Password: admin123

2. Demo User
   - Email: demo@neondb.io
   - Password: demo123

## Troubleshooting

### 500 Internal Server Errors

If you see 500 errors in the browser console:

1. Check if all services are running:
   ```bash
   ./check-services.sh
   ```

2. Make sure the Vite proxy configuration in `vite.config.js` is correctly forwarding requests to the right services

3. Restart only the UI components:
   ```bash
   ./restart-ui.sh
   ```

### Common Issues

1. **Port conflicts**: The scripts automatically try to free up occupied ports, but you may need to manually kill processes:
   ```bash
   lsof -ti:3081 | xargs kill -9  # Express server
   lsof -ti:5173 | xargs kill -9  # Vite dev server
   ```

2. **Backend not starting**: Check Docker container status:
   ```bash
   docker ps
   ```

3. **PostgreSQL connection issues**: Verify your local PostgreSQL is running and accessible:
   ```bash
   psql -U youruser -d postgres
   ```

4. **"Failed to fetch" errors**: Check browser console for CORS or proxy issues. Make sure the Vite server is running with the correct proxy settings.

## Development

The UI uses:
- React with Chakra UI for the frontend
- Express.js for the backend API
- Vite for development server and building

## Features

- **Database Management**: Create, view, and delete databases
- **Cross-Platform Connectivity**: Manage both local PostgreSQL and Neon compute PostgreSQL instances
- **Real-time Status Monitoring**: View the status of all connected database services
- **Modern UI**: Dark/light mode support with a clean, responsive interface
- **SQL Editor**: Execute SQL commands directly from the UI

## Architecture

The Neon UI is built with a modern frontend stack and connects to multiple backend services:

```
┌─────────────┐    ┌──────────────────┐    ┌─────────────────┐
│             │    │                  │    │                 │
│  React UI   │───►│  PostgreSQL API  │───►│  Local Postgres │
│             │    │                  │    │                 │
└─────────────┘    └──────────────────┘    └─────────────────┘
       │                    │
       │                    │
       ▼                    ▼
┌─────────────┐    ┌─────────────────┐
│             │    │                 │
│  Neon APIs  │───►│  Neon Postgres  │
│             │    │                 │
└─────────────┘    └─────────────────┘
```

### Frontend

- React with Vite for lightning-fast development
- Chakra UI for responsive, accessible components
- React Router for navigation
- Axios for API communication

### Backend

- Express server for the PostgreSQL API
- Connection to both local PostgreSQL and Neon compute PostgreSQL
- Integration with Neon pageserver, safekeepers, and compute node

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) for running Neon backend services
- Local PostgreSQL installation (optional, for local database connectivity)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/neon-ui.git
   cd neon-ui
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start all services
   ```bash
   npm run start
   ```

This will:
- Start the Neon backend services in Docker
- Launch the PostgreSQL API server 
- Start the Vite development server

### Connectivity Check

You can verify connectivity to all backend services:

```bash
npm run check
```

This will test connections to:
- Local PostgreSQL
- Neon PostgreSQL
- Pageserver API
- Compute API
- PostgreSQL API Server

## Usage

### Database Management

The Databases tab lets you:
- View all databases (both local and Neon)
- Create new databases
- Delete existing databases
- Copy connection strings

### SQL Editor

The SQL Editor allows you to:
- Execute SQL commands against any database
- View results in a tabular format
- Save and load queries

## Development

### Available Scripts

- `npm run dev` - Start the development server
- `npm run start` - Start all services (recommended)
- `npm run check` - Check connectivity to all backend services
- `npm run build` - Build for production
- `npm run preview` - Preview the production build

### Project Structure

```
neon-ui/
├── public/            # Static assets
├── src/
│   ├── api/           # API clients
│   ├── components/    # Reusable UI components
│   ├── pages/         # Page components
│   ├── App.jsx        # Main application component
│   ├── main.jsx       # Application entry point
│   └── theme.js       # Chakra UI theme configuration
├── postgres-server.js # PostgreSQL API server
├── check-connectivity.js # Service connectivity checker
├── start.sh           # Script to start all services
└── package.json       # Dependencies and scripts
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Neon Database](https://neon.tech/) for the original Neon project
- [Chakra UI](https://chakra-ui.com/) for the component library
- [React](https://reactjs.org/) for the UI framework # apployd-frontend
