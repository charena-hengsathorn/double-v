# Double V - Developer Guide

## Project Structure

```
double-v/
├── project/
│   ├── strapi/              # Strapi CMS backend
│   ├── predictive-service/  # Python FastAPI service
│   └── frontend/            # Next.js frontend
├── docs/                    # Documentation
├── scripts/                 # Utility scripts
└── .github/workflows/       # CI/CD pipelines
```

## Local Development Setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- PostgreSQL (or use Docker)
- Git

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/charena-hengsathorn/double-v.git
   cd double-v
   ```

2. **Start all services**:
   ```bash
   ./start-demo.sh
   ```

   This script will:
   - Check for required services
   - Clear caches
   - Create `.env.local` files if needed
   - Start Strapi, Predictive Service, and Frontend
   - Open browser automatically

### Manual Setup

#### Strapi

```bash
cd project/strapi
npm install
cp env.example .env.local
# Edit .env.local with your database credentials
npm run develop
```

#### Predictive Service

```bash
cd project/predictive-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp env.example .env.local
# Edit .env.local with your configuration
uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd project/frontend
npm install
cp env.example .env.local
# Edit .env.local with your API URLs
npm run dev
```

## Architecture

### Service Communication

```
┌─────────────┐
│   Frontend  │ (Next.js)
│  (Port 3000)│
└──────┬──────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌─────────────┐   ┌──────────────┐
│    Strapi   │   │  Predictive │
│  (Port 1337)│   │  (Port 8000) │
└──────┬──────┘   └──────┬───────┘
       │                 │
       └────────┬────────┘
                │
                ▼
         ┌─────────────┐
         │ PostgreSQL  │
         └─────────────┘
```

### Data Flow

1. **Strapi** stores all source-of-truth data (clients, deals, billings, etc.)
2. **Predictive Service** pulls data from Strapi, computes forecasts
3. **Frontend** fetches data from both Strapi and Predictive Service
4. **Webhooks** trigger forecast recomputation when Strapi data changes

## API Endpoints

### Strapi API (Base: `/api`)

- `GET /api/clients` - List all clients
- `GET /api/pipeline-deals` - List pipeline deals (with filters)
- `GET /api/billings` - List billing records
- `POST /api/pipeline-deals` - Create new deal
- See [API Specification](./api-specification.md) for complete details

### Predictive Service API (Base: `/api/v1`)

- `GET /api/v1/health` - Health check
- `GET /api/v1/models/forecast/base` - Base forecast
- `GET /api/v1/models/forecast/scenario/{scenario_id}` - Scenario forecast
- `GET /api/v1/models/risk/heatmap` - Risk heatmap
- `GET /api/v1/models/variance/waterfall` - Forecast waterfall
- Interactive docs: http://localhost:8000/api/v1/docs

## Development Workflow

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Update code in appropriate service directory
   - Update tests if needed
   - Update documentation if API changes

3. **Test locally**:
   ```bash
   # Run tests
   cd project/predictive-service && pytest
   cd project/frontend && npm test
   
   # Start services and verify
   ./start-demo.sh
   ```

4. **Commit and push**:
   ```bash
   git add .
   git commit -m "feat: your feature description"
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request** on GitHub

### Testing

#### Backend Tests

```bash
cd project/predictive-service
source venv/bin/activate
pytest
```

#### Frontend Tests

```bash
cd project/frontend
npm test
```

#### Integration Tests

```bash
./scripts/test-apis.sh
```

## Environment Variables

### Strapi (`project/strapi/.env.local`)

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/strapi
JWT_SECRET=your-secret
APP_KEYS=your-keys
```

### Predictive Service (`project/predictive-service/.env.local`)

```env
STRAPI_URL=http://localhost:1337/api
STRAPI_API_TOKEN=your-token
CORS_ORIGINS=http://localhost:3000
```

### Frontend (`project/frontend/.env.local`)

```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337/api
NEXT_PUBLIC_PREDICTIVE_SERVICE_URL=http://localhost:8000/api/v1
```

## Deployment

### Heroku (Backend Services)

```bash
# Strapi
cd project/strapi
heroku git:remote -a double-v-strapi
git push heroku main

# Predictive Service
cd project/predictive-service
heroku git:remote -a double-v-predictive
git push heroku main
```

### Vercel (Frontend)

```bash
cd project/frontend
vercel --prod
```

Or push to `main` branch (auto-deploys via GitHub Actions)

## Debugging

### Check Service Logs

```bash
# Strapi
tail -f /tmp/strapi.log

# Predictive Service
tail -f /tmp/predictive.log

# Frontend
tail -f /tmp/frontend.log
```

### Common Issues

1. **Port conflicts**: Kill processes on ports 1337, 8000, 3000
2. **Database connection**: Verify PostgreSQL is running and credentials are correct
3. **CORS errors**: Check CORS_ORIGINS in predictive service
4. **404 errors**: Verify Strapi permissions are configured

## Code Style

### Python

- Follow PEP 8
- Use type hints
- Format with `black` (optional)

### TypeScript/JavaScript

- Use TypeScript for new code
- Follow ESLint rules
- Use Prettier for formatting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Resources

- [Strapi Documentation](https://docs.strapi.io)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [API Specification](./api-specification.md)
- [Technical Specifications](./technical-specifications.md)





