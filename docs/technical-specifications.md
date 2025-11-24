# Technical Specifications

## Authentication & Authorization

### Authentication Strategy

**Primary Method:** JWT (JSON Web Tokens) via Strapi Auth

#### Token Flow
1. User authenticates via `POST /api/auth/local` with email/password
2. Strapi returns JWT token (expires in 7 days)
3. Client stores token in secure HTTP-only cookie or localStorage
4. All subsequent requests include token in `Authorization: Bearer <token>` header
5. Token refresh via `POST /api/auth/refresh` before expiration

#### Token Structure
```json
{
  "id": 1,
  "iat": 1642248000,
  "exp": 1642852800,
  "email": "user@example.com",
  "role": {
    "id": 1,
    "name": "Authenticated",
    "type": "authenticated"
  }
}
```

### Role-Based Access Control (RBAC)

#### Roles
1. **Public** (unauthenticated)
   - Read-only access to public dashboards (if configured)
   - No API access

2. **Authenticated** (base user)
   - View own deals and forecasts
   - Update own deals (limited fields)
   - View team dashboards

3. **Sales** (sales team)
   - Full CRUD on deals assigned to them
   - View all deals in their region/segment
   - Create/update risk flags
   - Export reports

4. **Finance** (finance team)
   - Read-only access to all deals
   - Create/update billings
   - View financial dashboards
   - Export financial reports
   - Override forecast snapshots (with approval)

5. **Executive** (executives)
   - Read-only access to all data
   - View executive summary
   - Export all reports
   - Cannot modify data

6. **Admin** (system administrators)
   - Full system access
   - User management
   - System configuration
   - Data import/export

#### Permission Matrix

| Action | Public | Authenticated | Sales | Finance | Executive | Admin |
|--------|--------|---------------|-------|---------|-----------|-------|
| View own deals | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View all deals | ❌ | ❌ | ✅ (region) | ✅ | ✅ | ✅ |
| Create deals | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| Update deals | ❌ | ✅ (own) | ✅ (assigned) | ❌ | ❌ | ✅ |
| Delete deals | ❌ | ❌ | ✅ (own) | ❌ | ❌ | ✅ |
| View forecasts | ❌ | ✅ (own) | ✅ | ✅ | ✅ | ✅ |
| Override forecasts | ❌ | ❌ | ❌ | ✅ (with approval) | ❌ | ✅ |
| Create billings | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| View financials | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Export reports | ❌ | ❌ | ✅ (limited) | ✅ | ✅ | ✅ |
| Manage users | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

### Session Management
- **Session Timeout:** 30 minutes of inactivity
- **Token Expiration:** 7 days
- **Refresh Token:** 30 days (if implemented)
- **Concurrent Sessions:** Maximum 3 per user

### Multi-Factor Authentication (Future)
- Optional 2FA via TOTP (Time-based One-Time Password)
- SMS backup codes
- Recovery email verification

---

## Security

### API Security

#### HTTPS/TLS
- **Requirement:** All production traffic must use HTTPS
- **TLS Version:** Minimum TLS 1.2, preferred TLS 1.3
- **Certificate:** Valid SSL certificate from trusted CA
- **HSTS:** HTTP Strict Transport Security enabled

#### Input Validation
- **Sanitization:** All user inputs sanitized to prevent XSS
- **SQL Injection Prevention:** Parameterized queries only (Strapi handles this)
- **Type Validation:** Strict type checking on all API inputs
- **Length Limits:** Maximum field lengths enforced
- **File Upload:** Restricted file types, size limits, virus scanning

#### Rate Limiting
- **Per User:** 100 requests/minute (Strapi), 50 requests/minute (Predictive Service)
- **Per IP:** 200 requests/minute (prevents abuse)
- **Bulk Operations:** 10 requests/minute
- **Authentication Endpoints:** 5 attempts/minute (prevents brute force)

#### CORS (Cross-Origin Resource Sharing)
```javascript
{
  "origin": ["https://dashboard.example.com", "https://app.example.com"],
  "methods": ["GET", "POST", "PATCH", "DELETE"],
  "allowedHeaders": ["Authorization", "Content-Type"],
  "credentials": true,
  "maxAge": 86400
}
```

#### Webhook Security
- **HMAC Signatures:** All webhook requests must include valid HMAC-SHA256 signature
- **Secret Key:** Stored in environment variables, rotated quarterly
- **Timestamp Validation:** Reject requests older than 5 minutes
- **Nonce Tracking:** Prevent replay attacks

#### API Keys (Service-to-Service)
- **Predictive Service → Strapi:** Service account with limited permissions
- **Rotation:** Every 90 days
- **Storage:** Environment variables or secret management service

### Data Security

#### Encryption
- **At Rest:** Database encryption enabled (PostgreSQL TDE or disk encryption)
- **In Transit:** TLS 1.3 for all connections
- **Sensitive Fields:** PII encrypted at application level (if required by compliance)

#### Data Masking
- **Logs:** Sensitive data (emails, deal values) masked in application logs
- **Error Messages:** No sensitive data exposed in error responses
- **Debug Mode:** Disabled in production

#### Backup Security
- **Encryption:** All backups encrypted
- **Access Control:** Backup access restricted to authorized personnel
- **Retention:** 30 days for daily backups, 12 months for monthly backups

### Vulnerability Management
- **Dependency Scanning:** Automated scanning via Dependabot/Snyk
- **Security Updates:** Critical patches applied within 24 hours
- **Penetration Testing:** Annual third-party security audit
- **Bug Bounty:** Optional program for responsible disclosure

---

## Performance Requirements

### Response Time Targets

#### API Endpoints
- **Simple Queries (GET single entity):** < 200ms (p95)
- **List Queries (GET with filters):** < 500ms (p95)
- **Complex Aggregations:** < 2s (p95)
- **Forecast Calculations:** < 5s (p95)
- **Monte Carlo Simulations:** < 30s (p95)

#### Frontend
- **Initial Page Load:** < 2s
- **Time to Interactive:** < 3s
- **Chart Rendering:** < 1s after data loaded
- **Dashboard Refresh:** < 3s

### Scalability Targets

#### Concurrent Users
- **Development:** 10 concurrent users
- **Staging:** 50 concurrent users
- **Production:** 500+ concurrent users

#### Data Volume
- **Deals:** 10,000+ active deals
- **Snapshots:** 1,000,000+ forecast snapshots
- **Billings:** 100,000+ billing records
- **Query Performance:** Maintain < 500ms for 95th percentile even at scale

### Caching Strategy

#### Application-Level Caching
- **Redis Cache:** For frequently accessed data
  - Forecast snapshots: 5-minute TTL
  - Deal aggregations: 1-minute TTL
  - User sessions: 30-minute TTL
- **CDN:** Static assets (images, fonts, JS bundles)

#### Database Optimization
- **Indexes:** On all foreign keys, frequently filtered fields, and date ranges
- **Materialized Views:** For complex aggregations (refreshed hourly)
- **Query Optimization:** Explain plans reviewed, slow queries logged
- **Connection Pooling:** PgBouncer or Strapi connection pooling

#### Frontend Caching
- **Service Workers:** Cache static assets
- **Browser Cache:** API responses cached with appropriate headers
- **React Query/SWR:** Client-side caching for API data

### Database Performance

#### Indexes Required
```sql
-- Pipeline Deals
CREATE INDEX idx_deals_stage ON pipeline_deals(stage);
CREATE INDEX idx_deals_status ON pipeline_deals(status);
CREATE INDEX idx_deals_close_date ON pipeline_deals(expected_close_date);
CREATE INDEX idx_deals_probability ON pipeline_deals(probability);
CREATE INDEX idx_deals_project ON pipeline_deals(project_id);

-- Forecast Snapshots
CREATE INDEX idx_snapshots_date ON forecast_snapshots(snapshot_date);
CREATE INDEX idx_snapshots_scenario ON forecast_snapshots(scenario);
CREATE INDEX idx_snapshots_deal ON forecast_snapshots(deal_id);
CREATE INDEX idx_snapshots_month ON forecast_snapshots(expected_month);

-- Billings
CREATE INDEX idx_billings_date ON billings(invoice_date);
CREATE INDEX idx_billings_status ON billings(status);
CREATE INDEX idx_billings_deal ON billings(deal_id);
```

#### Materialized Views
```sql
-- Monthly Revenue Aggregation
CREATE MATERIALIZED VIEW monthly_revenue_summary AS
SELECT 
  DATE_TRUNC('month', expected_month) AS month,
  scenario,
  SUM(expected_amount) AS total_amount,
  COUNT(*) AS deal_count
FROM forecast_snapshots
GROUP BY month, scenario;

-- Refresh hourly
REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_revenue_summary;
```

### Monitoring & Alerting

#### Key Metrics
- **API Response Times:** p50, p95, p99
- **Error Rates:** 4xx and 5xx errors
- **Database Query Times:** Slow query log (> 1s)
- **Cache Hit Rates:** Redis cache performance
- **Active Connections:** Database and API connections
- **Memory Usage:** Application memory consumption
- **CPU Usage:** Server CPU utilization

#### Alert Thresholds
- **Response Time:** Alert if p95 > 2s for 5 minutes
- **Error Rate:** Alert if error rate > 1% for 5 minutes
- **Database Connections:** Alert if > 80% of max connections
- **Memory Usage:** Alert if > 85% of available memory
- **Disk Space:** Alert if < 20% free space

---

## Error Handling

### Error Response Format
```json
{
  "error": {
    "status": 400,
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "probability",
        "issue": "Value must be between 0 and 1",
        "received": 1.5
      }
    ],
    "request_id": "req_abc123",
    "timestamp": "2024-01-15T10:00:00.000Z"
  }
}
```

### Error Codes

#### Client Errors (4xx)
- `VALIDATION_ERROR` (400): Invalid input data
- `UNAUTHORIZED` (401): Missing or invalid authentication
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Resource conflict (e.g., duplicate)
- `UNPROCESSABLE_ENTITY` (422): Business logic validation failed
- `TOO_MANY_REQUESTS` (429): Rate limit exceeded

#### Server Errors (5xx)
- `INTERNAL_SERVER_ERROR` (500): Unexpected server error
- `SERVICE_UNAVAILABLE` (503): Service temporarily unavailable
- `GATEWAY_TIMEOUT` (504): Upstream service timeout

### Retry Logic

#### Automatic Retries
- **Transient Errors (5xx, 503, 504):** Retry with exponential backoff
  - Initial delay: 1 second
  - Max retries: 3
  - Max delay: 10 seconds
- **Rate Limit (429):** Retry after `Retry-After` header
- **Network Errors:** Retry with exponential backoff (same as transient errors)

#### No Retries
- **Client Errors (4xx):** Do not retry (except 429)
- **Authentication Errors (401):** Do not retry, refresh token instead

### Logging

#### Log Levels
- **ERROR:** Application errors, exceptions
- **WARN:** Deprecated features, performance issues
- **INFO:** Important business events (deal created, forecast updated)
- **DEBUG:** Detailed debugging information (development only)

#### Log Format
```json
{
  "timestamp": "2024-01-15T10:00:00.000Z",
  "level": "ERROR",
  "service": "predictive-service",
  "request_id": "req_abc123",
  "user_id": 1,
  "message": "Forecast calculation failed",
  "error": {
    "type": "ValueError",
    "message": "Invalid probability value",
    "stack_trace": "..."
  },
  "context": {
    "deal_id": 123,
    "scenario": "base"
  }
}
```

#### Sensitive Data
- **Never Log:** Passwords, tokens, credit card numbers
- **Mask in Logs:** Email addresses, deal values (in non-production), PII

---

## Data Validation

### Field Validation Rules

#### Pipeline Deals
- `stage`: Enum (proposal, negotiation, contracting, closed, lost)
- `status`: Enum (active, paused, cancelled)
- `probability`: Float, range [0, 1]
- `deal_value`: Decimal, > 0
- `currency`: ISO 4217 currency code (THB, USD, EUR, etc.)
- `expected_close_date`: Date, must be in future (or allow past for historical)
- `recognition_start_month`: Date, must be >= expected_close_date
- `recognition_end_month`: Date, must be > recognition_start_month

#### Forecast Snapshots
- `scenario`: Enum (base, best, worst) or custom string
- `probability`: Float, range [0, 1]
- `expected_amount`: Decimal, >= 0
- `expected_month`: Date, valid month format
- `model_version`: String, semantic version format

#### Billings
- `amount`: Decimal, > 0
- `currency`: ISO 4217 currency code
- `invoice_date`: Date, valid date
- `collected_date`: Date, nullable, must be >= invoice_date if provided
- `status`: Enum (pending, collected, overdue, cancelled)

### Business Rules

#### Deal Validation
- Deal cannot be in "closed" stage with probability < 1.0
- Deal cannot have milestones scheduled before expected_close_date
- Deal value must equal sum of milestone amounts (with tolerance)

#### Forecast Validation
- Snapshot date cannot be in the future
- Expected month cannot be more than 5 years in the future
- Probability-weighted amount must be <= deal_value

#### Billing Validation
- Billing amount cannot exceed milestone amount
- Cannot create billing for deal in "lost" stage
- Recognition month must be within deal's recognition window

---

## Currency Handling

### Supported Currencies
- **Primary:** THB (Thai Baht)
- **Secondary:** USD, EUR, GBP, JPY, SGD, AUD

### Currency Conversion
- **Base Currency:** THB (all aggregations converted to THB)
- **Exchange Rates:** 
  - Source: External API (e.g., ExchangeRate-API, Fixer.io)
  - Update Frequency: Daily at midnight UTC
  - Historical Rates: Stored for past 12 months
- **Conversion Logic:** 
  - Store original currency and amount
  - Convert to base currency for aggregations
  - Display in original currency in UI with THB equivalent

### Exchange Rate Storage
```sql
CREATE TABLE exchange_rates (
  id SERIAL PRIMARY KEY,
  from_currency VARCHAR(3) NOT NULL,
  to_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(10, 6) NOT NULL,
  effective_date DATE NOT NULL,
  source VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(from_currency, to_currency, effective_date)
);
```

---

## Timezone Handling

### Timezone Strategy
- **Database:** Store all dates/times in UTC
- **API:** Accept and return dates in ISO 8601 format with timezone
- **Frontend:** Convert to user's local timezone for display
- **Business Logic:** Use UTC for all calculations

### Date Fields
- **Date-only fields** (expected_close_date, recognition_start_month): Store as DATE (no time component)
- **Timestamp fields** (created_at, last_activity_at): Store as TIMESTAMP WITH TIME ZONE

### User Timezone
- **Default:** UTC
- **User Preference:** Allow users to set timezone in profile
- **Display:** All dates/times displayed in user's preferred timezone

---

## Data Retention & Archival

### Retention Policies
- **Active Deals:** Indefinite (until marked as closed/lost)
- **Forecast Snapshots:** 5 years
- **Billings:** 7 years (compliance requirement)
- **Risk Flags:** 3 years after resolution
- **Activity Logs:** 1 year
- **Audit Logs:** 7 years

### Archival Strategy
- **Archive Frequency:** Monthly
- **Archive Location:** Separate archive database or cold storage
- **Access:** Read-only access to archived data
- **Restoration:** On-demand restoration process (within 24 hours)

---

## Backup & Recovery

### Backup Strategy
- **Database Backups:**
  - Full backup: Daily at 2 AM UTC
  - Incremental backup: Every 6 hours
  - Retention: 30 days for daily, 12 months for monthly
- **File Backups:** 
  - Uploaded files: Daily backup
  - Configuration files: Weekly backup
- **Backup Storage:** 
  - Primary: Cloud storage (S3, Azure Blob)
  - Secondary: Off-site backup (different region)

### Recovery Objectives
- **RTO (Recovery Time Objective):** 4 hours
- **RPO (Recovery Point Objective):** 6 hours (maximum data loss)

### Disaster Recovery
- **Failover:** Automated failover to secondary region
- **Testing:** Quarterly DR drills
- **Documentation:** Runbooks for common failure scenarios

---

## Deployment Architecture

### Environment Strategy
1. **Development:** Local development environments
2. **Staging:** Production-like environment for testing
3. **Production:** Live production environment

### Infrastructure Components
- **Application Servers:** Containerized (Docker) on cloud platform
- **Database:** Managed PostgreSQL service (RDS, Azure Database)
- **Cache:** Redis cluster
- **Load Balancer:** Application load balancer
- **CDN:** CloudFront/Cloudflare for static assets
- **Monitoring:** CloudWatch/Datadog/New Relic

### Scaling Strategy
- **Horizontal Scaling:** Auto-scaling based on CPU/memory metrics
- **Database Scaling:** Read replicas for read-heavy operations
- **Caching:** Redis cluster for distributed caching

---

## API Versioning

### Versioning Strategy
- **URL Versioning:** `/api/v1/`, `/api/v2/`
- **Current Version:** v1
- **Deprecation Policy:** 
  - Deprecated versions supported for 12 months
  - 6-month notice before removal
  - Migration guide provided

### Version Headers
```
API-Version: 1.0
Deprecation: false
Sunset: null
```

---

## Testing Strategy

### Test Types
1. **Unit Tests:** 
   - Coverage target: 80%+
   - Framework: Jest (frontend), pytest (backend)
2. **Integration Tests:**
   - API endpoint testing
   - Database integration
   - Service-to-service communication
3. **E2E Tests:**
   - Critical user journeys
   - Framework: Playwright or Cypress
4. **Performance Tests:**
   - Load testing with k6 or Locust
   - Stress testing for capacity planning

### Test Data
- **Fixtures:** Reusable test data fixtures
- **Factories:** Data factories for generating test data
- **Seeding:** Database seeding scripts for test environments

---

## Documentation Standards

### API Documentation
- **Format:** OpenAPI 3.0 (Swagger)
- **Location:** `/api/docs` endpoint
- **Examples:** Request/response examples for all endpoints
- **Schemas:** JSON Schema definitions for all data models

### Code Documentation
- **Comments:** JSDoc/TSDoc for functions and classes
- **README:** Each service/module has README with setup instructions
- **Architecture Diagrams:** Updated Mermaid diagrams in `/docs`

---

## Compliance & Privacy

### Data Privacy
- **GDPR Compliance:** If applicable, user data export/deletion capabilities
- **PII Handling:** Minimal collection, encrypted storage, access logging
- **Data Minimization:** Only collect necessary data

### Audit Requirements
- **Audit Logs:** All data modifications logged with user, timestamp, action
- **Access Logs:** All API access logged
- **Retention:** 7 years for audit logs

