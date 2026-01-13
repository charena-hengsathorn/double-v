# Double V API Server

Unified API server that acts as a middleware/proxy between the frontend and backend services (Strapi CMS and Predictive Service).

## Features

- ✅ **Unified API Gateway**: Single entry point for all API requests
- ✅ **Request Proxying**: Routes requests to appropriate backend services
- ✅ **Authentication Pass-through**: Forwards JWT tokens to backend services
- ✅ **CORS Handling**: Centralized CORS configuration
- ✅ **Error Handling**: Consistent error responses
- ✅ **Request Logging**: Track requests with unique IDs
- ✅ **Health Checks**: Monitor service status
- ✅ **Security**: Helmet.js for security headers
- ✅ **Compression**: Response compression for better performance

## Architecture

```
Frontend (Next.js)
    ↓
API Server (Node.js/Express) ← You are here
    ↓                    ↓
Strapi CMS          Predictive Service
```

## Setup

### Prerequisites

- Node.js 18+ and npm 9+
- Strapi service running (default: http://localhost:1337)
- Predictive Service running (default: http://localhost:8000)

### Installation

```bash
cd project/api-server
npm install
```

### Configuration

1. Copy environment example:
```bash
cp env.example .env
```

2. Edit `.env` with your configuration:
```env
PORT=4000
NODE_ENV=development
STRAPI_URL=http://localhost:1337
PREDICTIVE_SERVICE_URL=http://localhost:8000
CORS_ORIGINS=http://localhost:3000
```

### Development

```bash
npm run dev
```

Server will run on http://localhost:4000 (or your configured PORT)

### Production

```bash
npm run build
npm start
```

## API Endpoints

### Health Checks

- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health including backend service status

### Strapi Proxy

All Strapi endpoints are available under `/api/v1/strapi/*`:

- `GET /api/v1/strapi/clients` → Strapi `/api/clients`
- `GET /api/v1/strapi/pipeline-deals` → Strapi `/api/pipeline-deals`
- `GET /api/v1/strapi/sales` → Strapi `/api/sales`
- etc.

### Predictive Service Proxy

All Predictive Service endpoints are available under `/api/v1/predictive/*`:

- `GET /api/v1/predictive/models/forecast/base` → Predictive Service `/api/v1/models/forecast/base`
- `GET /api/v1/predictive/models/risk/heatmap` → Predictive Service `/api/v1/models/risk/heatmap`
- etc.

## Usage from Frontend

Update your frontend API client (`lib/api.ts`) to use the new API server:

```typescript
const API_SERVER_URL = process.env.NEXT_PUBLIC_API_SERVER_URL || 'http://localhost:4000';

// Strapi requests
const response = await fetch(`${API_SERVER_URL}/api/v1/strapi/clients`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

// Predictive Service requests
const forecast = await fetch(`${API_SERVER_URL}/api/v1/predictive/models/forecast/base`);
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `NODE_ENV` | Environment | `development` |
| `STRAPI_URL` | Strapi backend URL | `http://localhost:1337` |
| `PREDICTIVE_SERVICE_URL` | Predictive service URL | `http://localhost:8000` |
| `CORS_ORIGINS` | Allowed CORS origins (comma-separated) | `http://localhost:3000` |

## Project Structure

```
api-server/
├── src/
│   ├── server.ts              # Main server entry point
│   ├── middleware/
│   │   ├── auth.ts            # Authentication middleware
│   │   ├── errorHandler.ts    # Error handling
│   │   └── requestLogger.ts   # Request logging
│   └── routes/
│       ├── health.ts          # Health check routes
│       ├── strapi.ts          # Strapi proxy routes
│       └── predictive.ts      # Predictive service proxy routes
├── dist/                      # Compiled JavaScript (build output)
├── package.json
├── tsconfig.json
└── README.md
```

## Benefits of Using This Server

1. **Single API Endpoint**: Frontend only needs to know one URL
2. **Backend Abstraction**: Can swap backend services without frontend changes
3. **Centralized Logic**: Add caching, rate limiting, transformations in one place
4. **Security**: Hide backend URLs from browser
5. **Consistent Errors**: Unified error response format
6. **Request Tracing**: Track requests across services with request IDs
7. **CORS Management**: Handle CORS in one place

## Next Steps

1. Update frontend API client to use new server
2. Remove Next.js API routes (`/app/api/*`) if no longer needed
3. Add rate limiting per user/IP
4. Add request/response caching
5. Add API versioning
6. Add request validation
7. Add metrics/monitoring

## Deployment

This server can be deployed to:
- Heroku (similar to other services)
- Railway
- Render
- AWS/GCP/Azure
- Docker container

Create a `Procfile` for Heroku:
```
web: node dist/server.js
```

## License

MIT



