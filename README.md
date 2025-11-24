# Double V - Executive Dashboard Suite

Revenue forecasting and pipeline management dashboard for executives.

## Project Structure

```
double-v/
├── project/
│   ├── strapi/              # Strapi CMS backend
│   ├── predictive-service/  # Python FastAPI forecasting service
│   └── frontend/            # Next.js frontend application
├── docs/                    # Project documentation
├── scripts/                 # Automation scripts
└── .github/workflows/       # CI/CD workflows
```

## Architecture

- **Frontend**: Next.js (deployed on Vercel)
- **Backend CMS**: Strapi (deployed on Heroku)
- **Predictive Service**: Python FastAPI (deployed on Heroku)
- **Database**: PostgreSQL (Heroku Postgres)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL 14+
- Git
- Heroku CLI
- Vercel CLI

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/charena-hengsathorn/double-v.git
   cd double-v
   ```

2. **Set up Strapi**
   ```bash
   cd project/strapi
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   npm run develop
   ```

3. **Set up Predictive Service**
   ```bash
   cd project/predictive-service
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your Strapi URL and API token
   uvicorn app.main:app --reload
   ```

4. **Set up Frontend**
   ```bash
   cd project/frontend
   npm install
   cp .env.example .env.local
   # Edit .env.local with your API URLs
   npm run dev
   ```

## Deployment

### Heroku Deployment

#### Strapi
```bash
cd project/strapi
heroku create double-v-strapi
heroku addons:create heroku-postgresql:mini
heroku config:set NODE_ENV=production
git subtree push --prefix project/strapi heroku main
```

#### Predictive Service
```bash
cd project/predictive-service
heroku create double-v-predictive
heroku addons:create scheduler:standard
heroku config:set ENVIRONMENT=production
# Set STRAPI_URL and other required env vars
git subtree push --prefix project/predictive-service heroku main
```

### Vercel Deployment

```bash
cd project/frontend
vercel
# Follow prompts to configure environment variables
```

Or connect your GitHub repository to Vercel for automatic deployments.

## Environment Variables

See `.env.example` files in each service directory for required environment variables.

### Strapi Required Variables
- `DATABASE_URL` (from Heroku Postgres)
- `JWT_SECRET`
- `ADMIN_JWT_SECRET`
- `APP_KEYS`
- `API_TOKEN_SALT`
- `TRANSFER_TOKEN_SALT`

### Predictive Service Required Variables
- `STRAPI_URL`
- `STRAPI_API_TOKEN`
- `STRAPI_WEBHOOK_SECRET`
- `CORS_ORIGINS`

### Frontend Required Variables
- `NEXT_PUBLIC_STRAPI_URL`
- `NEXT_PUBLIC_PREDICTIVE_SERVICE_URL`
- `NEXT_PUBLIC_APP_URL`

## Documentation

- [Project Plan](./docs/project-plan.md)
- [Technical Scope](./docs/tech-scope.md)
- [API Specification](./docs/api-specification.md)
- [Technical Specifications](./docs/technical-specifications.md)
- [AI Execution Plan](./docs/ai-execution-plan.md)
- [Deployment Checklist](./docs/deployment-checklist.md)

## Development Workflow

1. Create a feature branch from `main`
2. Make changes and commit
3. Push to GitHub
4. Create a Pull Request
5. CI/CD will run tests and deploy to staging (if configured)
6. After review, merge to `main`
7. Automatic deployment to production

## Contributing

1. Follow the project structure
2. Write tests for new features
3. Update documentation
4. Follow the coding standards defined in the technical specifications

## License

[Add your license here]

## Support

For questions or issues, please open a GitHub issue.

