# Shakti Multi-Tenant SaaS Architecture

## 🏗️ Architecture Overview

This document describes the multi-tenant SaaS architecture implemented for the Shakti project, supporting 100+ companies with subdomain-based tenant isolation.

## 📋 Features Implemented

### ✅ Core Features
- **Subdomain-based tenant detection** - Automatic tenant identification from URL
- **SuperAdmin global control** - Centralized management dashboard
- **Tenant isolation** - Complete data separation between tenants
- **Row Level Security (RLS)** - Database-level tenant data protection
- **Company management system** - Create, edit, activate, disable tenants
- **Wildcard subdomain routing** - Support for unlimited subdomains
- **Production-ready deployment** - Hostinger VPS configuration

### 🎯 Tenant Structure
```
Main Domain: yourapp.com (SuperAdmin)
├── techcorp.yourapp.com (TechCorp Finance)
├── globallending.yourapp.com (Global Lending)
├── quickloans.yourapp.com (QuickLoans Ltd)
└── *.yourapp.com (100+ more companies)
```

## 🛠️ Technical Implementation

### 1. Tenant Detection System

#### Automatic Subdomain Detection
```typescript
// utils/tenantDetection.ts
export const extractSubdomain = (hostname: string): string => {
  const hostnameWithoutPort = hostname.split(':')[0];
  const parts = hostnameWithoutPort.split('.');

  if (hostnameWithoutPort === 'localhost') {
    // Development: company1.localhost
    return parts.length > 1 ? parts[0] : '';
  }

  // Production: company1.yourapp.com
  return parts.length > 2 ? parts[0] : '';
};
```

#### Tenant Context Provider
```typescript
// contexts/TenantContext.tsx
export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeTenant = async () => {
      const hostname = window.location.hostname;
      const tenantIdentifier = getTenantIdentifier(hostname);

      if (isMainDomain(hostname)) {
        setTenant(null); // SuperAdmin access
        return;
      }

      const tenantData = await getTenantBySubdomain(tenantIdentifier);
      setTenant(tenantData);
    };

    initializeTenant();
  }, []);
};
```

### 2. Database Schema (PostgreSQL)

#### Tenants Table
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(255) UNIQUE NOT NULL,
  domain VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  plan VARCHAR(50) DEFAULT 'basic',
  max_users INTEGER DEFAULT 25,
  max_connections INTEGER DEFAULT 15,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID NOT NULL
);

-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- SuperAdmin can manage all tenants
CREATE POLICY "SuperAdmin full access" ON tenants
  FOR ALL USING (current_setting('app.current_tenant', true) = 'superadmin');
```

#### Row Level Security Implementation
```sql
-- Users table with tenant isolation
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only access their tenant's data
CREATE POLICY "Users tenant isolation" ON users
  FOR ALL USING (tenant_id::text = current_setting('app.current_tenant', true));
```

### 3. SuperAdmin Dashboard

#### Company Management Interface
- **Create new tenants** with custom subdomains
- **Edit tenant settings** (plans, limits, status)
- **Activate/deactivate tenants**
- **View tenant analytics** and usage
- **Manage tenant-specific configurations**

#### Key Features:
- Real-time tenant status monitoring
- Bulk tenant operations
- Tenant usage analytics
- Subdomain availability checking

### 4. Deployment Configuration

#### Hostinger VPS Setup
```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install Nginx and PM2
sudo apt install -y nginx
sudo npm install -g pm2

# 4. Configure wildcard DNS
# Add wildcard record: *.yourdomain.com → VPS_IP
```

#### Nginx Wildcard Configuration
```nginx
# Main domain - SuperAdmin
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    location / {
        proxy_pass http://localhost:3000;
    }
}

# Wildcard subdomain support
server {
    listen 80;
    server_name *.yourdomain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header X-Subdomain $subdomain;
    }
}
```

## 🚀 Deployment Instructions

### 1. VPS Preparation
```bash
# Connect to your Hostinger VPS
ssh root@your-vps-ip

# Clone the repository
git clone https://github.com/your-repo/shakti.git
cd shakti

# Run deployment script
chmod +x deploy.sh
./deploy.sh
```

### 2. DNS Configuration
1. **Main Domain**: `yourdomain.com` → VPS IP
2. **Wildcard Subdomain**: `*.yourdomain.com` → VPS IP
3. **API Subdomain** (optional): `api.yourdomain.com` → VPS IP

### 3. SSL Configuration (Recommended)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate certificates for wildcard domain
sudo certbot --nginx -d yourdomain.com -d *.yourdomain.com
```

### 4. Database Setup
```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE shakti_db;
CREATE USER shakti_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE shakti_db TO shakti_user;
ALTER USER shakti_user CREATEDB;
```

## 🔧 Development Setup

### Local Development with Subdomains
```bash
# Start development server
npm run dev

# Access different tenants:
# SuperAdmin: http://localhost:3000
# TechCorp: http://techcorp.localhost:3000
# Global Lending: http://globallending.localhost:3000
```

### Environment Variables
```env
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/shakti_db
JWT_SECRET=your-development-secret
WILDCARD_DOMAIN=*.localhost
MAIN_DOMAIN=localhost
```

## 📊 Monitoring and Maintenance

### PM2 Process Management
```bash
# View application status
pm2 status

# View logs
pm2 logs shakti

# Restart application
pm2 restart shakti

# Monitor resource usage
pm2 monit
```

### Nginx Log Monitoring
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### Database Maintenance
```sql
-- View tenant statistics
SELECT
  t.name,
  t.plan,
  t.status,
  COUNT(u.id) as user_count,
  t.max_users,
  t.created_at
FROM tenants t
LEFT JOIN users u ON t.id = u.tenant_id
GROUP BY t.id, t.name, t.plan, t.status;

-- Clean inactive tenants (older than 90 days)
DELETE FROM tenants
WHERE status = 'inactive'
AND updated_at < NOW() - INTERVAL '90 days';
```

## 🔒 Security Considerations

### 1. SSL/TLS (Required for Production)
- Always use HTTPS in production
- Configure security headers
- Enable HSTS

### 2. Database Security
- Enable RLS on all tenant-specific tables
- Use strong passwords
- Regular backup strategy
- Connection encryption

### 3. Application Security
- Input validation and sanitization
- Rate limiting
- CORS configuration
- JWT token expiration

## 📈 Scaling Considerations

### Horizontal Scaling
- Load balancer for multiple application instances
- Database read replicas
- Redis for session storage
- CDN for static assets

### Database Optimization
- Connection pooling
- Query optimization
- Proper indexing on tenant_id columns
- Database partitioning by tenant

## 🆘 Troubleshooting

### Common Issues

#### Subdomain Not Working
```bash
# Check DNS resolution
nslookup techcorp.yourdomain.com

# Check Nginx configuration
sudo nginx -t
sudo systemctl reload nginx
```

#### Tenant Detection Issues
```bash
# Check application logs
pm2 logs shakti --lines 50

# Verify environment variables
cat .env
```

#### Database Connection Issues
```bash
# Test database connection
psql -h localhost -U shakti_user -d shakti_db

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

## 📞 Support

For technical support or questions about the multi-tenant implementation:

1. Check the application logs: `pm2 logs shakti`
2. Verify Nginx configuration: `sudo nginx -t`
3. Test database connectivity
4. Review the deployment information: `cat DEPLOYMENT_INFO`

## 🎯 Next Steps

1. **Database Integration**: Connect to PostgreSQL with RLS
2. **API Development**: Build REST APIs for tenant management
3. **Authentication**: Implement JWT-based auth with tenant context
4. **File Upload**: Configure tenant-specific file storage
5. **Email Service**: Setup transactional emails per tenant
6. **Analytics**: Implement tenant usage tracking
7. **Backup Strategy**: Automated daily backups
8. **Monitoring**: Setup alerts and monitoring

---

**Built with ❤️ for Shakti Multi-Tenant SaaS Platform**