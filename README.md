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
- `STRAPI_URL` - Strapi API URL (e.g., `https://double-v-strapi-dd98523889e0.herokuapp.com/api`)
- `STRAPI_API_TOKEN` - API token for service-to-service authentication (generate in Strapi admin)
- `STRAPI_WEBHOOK_SECRET` - Secret for webhook verification (optional)
- `CORS_ORIGINS` - Comma-separated list of allowed origins

### Frontend Required Variables
- `NEXT_PUBLIC_STRAPI_URL`
- `NEXT_PUBLIC_PREDICTIVE_SERVICE_URL`
- `NEXT_PUBLIC_APP_URL`

## Documentation

### Core Documentation
- [Project Plan](./docs/project-plan.md) - Project phases and execution plan
- [Technical Scope](./docs/tech-scope.md) - Technical architecture and stack
- [API Specification](./docs/api-specification.md) - Complete API reference
- [Technical Specifications](./docs/technical-specifications.md) - Detailed technical specs
- [Developer Guide](./docs/developer-guide.md) - Setup and development workflow

### Integration & Deployment
- [Strapi to Predictive Service Connection](./STRAPI_PREDICTIVE_CONNECTION.md) - How the services connect
- [Deployment Links](./DEPLOYMENT_LINKS.md) - All deployment URLs and commands
- [Environment Variables](./ENV_VARS_SUMMARY.md) - Environment variable reference

### Additional Resources
- [User Guide](./docs/user-guide.md) - End-user documentation
- [Troubleshooting](./docs/troubleshooting.md) - Common issues and solutions
- [Strapi Setup Guide](./docs/strapi-setup-guide.md) - Strapi configuration
- [Strapi Webhook Setup](./docs/strapi-webhook-setup.md) - Webhook configuration

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

