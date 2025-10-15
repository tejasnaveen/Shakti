# 🚀 Hostinger VPS Deployment Guide - Shakti Multi-Tenant SaaS

## 📋 Prerequisites

Before deploying to Hostinger VPS, ensure you have:

1. **Hostinger VPS Account** - Active VPS hosting plan
2. **Domain Name** - Purchased domain (e.g., `yourcompany.com`)
3. **SSH Access** - VPS login credentials from Hostinger
4. **Project Files** - Complete Shakti project ready for deployment

## 🏗️ Step 1: VPS Preparation

### 1.1 Connect to Your VPS

```bash
# Replace with your actual VPS IP address
ssh root@your-vps-ip-address

# If you get a permission denied error, try:
ssh root@your-vps-ip-address -p 22
```

### 1.2 Update System Packages

```bash
# Update package lists
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git htop nano ufw
```

### 1.3 Install Node.js 18.x

```bash
# Install Node.js using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show latest version
```

### 1.4 Install Nginx

```bash
# Install Nginx web server
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

### 1.5 Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Configure PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u root --hp /root
```

### 1.6 Install PostgreSQL Database

```bash
# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql

# In PostgreSQL shell, run:
CREATE DATABASE shakti_db;
CREATE USER shakti_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE shakti_db TO shakti_user;
ALTER USER shakti_user CREATEDB;
\q
```

### 1.7 Setup Firewall

```bash
# Enable UFW firewall
sudo ufw enable

# Allow SSH (port 22)
sudo ufw allow 'OpenSSH'

# Allow HTTP and HTTPS (ports 80 and 443)
sudo ufw allow 'Nginx Full'

# Check firewall status
sudo ufw status
```

## 🌐 Step 2: Domain & DNS Configuration

### 2.1 Get Your VPS IP Address

```bash
# On your VPS, run:
curl -s http://icanhazip.com
# Note down this IP address
```

### 2.2 Configure DNS in Hostinger

1. **Login to Hostinger Dashboard**
2. **Go to Domains → Manage DNS**
3. **Add DNS Records:**

```
Type: A Record
Name: @
Value: YOUR_VPS_IP_ADDRESS
TTL: 14400

Type: A Record
Name: *
Value: YOUR_VPS_IP_ADDRESS
TTL: 14400

Type: A Record
Name: www
Value: YOUR_VPS_IP_ADDRESS
TTL: 14400
```

**Important DNS Records:**
- `@` → Main domain (yourdomain.com)
- `*` → Wildcard for subdomains (*.yourdomain.com)
- `www` → WWW version

### 2.3 Verify DNS Propagation

```bash
# Test DNS resolution (replace with your domain)
nslookup yourdomain.com
nslookup *.yourdomain.com

# Test subdomain resolution
nslookup test.yourdomain.com
```

## 📦 Step 3: Deploy Application

### 3.1 Upload Project Files

**Option A: Using Git (Recommended)**
```bash
# On your VPS
cd /opt
sudo mkdir shakti
sudo chown root:root shakti
cd shakti

# Clone your repository (replace with your actual repo URL)
git clone https://github.com/your-username/shakti.git .
```

**Option B: Using File Transfer**
```bash
# Upload files to /opt/shakti directory on VPS
# You can use SCP, SFTP, or Hostinger's file manager
```

### 3.2 Install Dependencies

```bash
# Navigate to project directory
cd /opt/shakti

# Install production dependencies
npm ci --production

# Build the application
npm run build
```

### 3.3 Configure Environment Variables

```bash
# Create .env file
nano .env
```

**Add the following to .env:**
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://shakti_user:your_secure_password@localhost:5432/shakti_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
WILDCARD_DOMAIN=*.yourdomain.com
MAIN_DOMAIN=yourdomain.com
```

**Save and exit:** `Ctrl+X`, `Y`, `Enter`

### 3.4 Setup Database Schema

```bash
# Navigate to database directory
cd /opt/shakti/database

# Run schema setup (adjust path if needed)
sudo -u postgres psql -d shakti_db -f schema.sql
```

### 3.5 Configure Nginx

```bash
# Remove default Nginx site
sudo rm -f /etc/nginx/sites-enabled/default

# Create new site configuration
sudo nano /etc/nginx/sites-available/shakti
```

**Add Nginx configuration:**
```nginx
# Main domain - SuperAdmin access
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Wildcard subdomain support
server {
    listen 80;
    server_name *.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Subdomain $subdomain;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable site and restart Nginx:**
```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/shakti /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## 🔒 Step 4: SSL Certificate Setup (Recommended)

### 4.1 Install Certbot

```bash
# Install Certbot for Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificates
sudo certbot --nginx -d yourdomain.com -d *.yourdomain.com

# Setup auto-renewal
sudo systemctl enable certbot.timer
```

### 4.2 Verify SSL Setup

```bash
# Check SSL certificate
sudo certbot certificates

# Test HTTPS access
curl -I https://yourdomain.com
```

## 🚀 Step 5: Start Application

### 5.1 Start with PM2

```bash
# Navigate to project directory
cd /opt/shakti

# Start application
pm2 start npm --name "shakti" -- run "serve"

# Save PM2 configuration
pm2 save

# Check application status
pm2 status

# View application logs
pm2 logs shakti
```

### 5.2 Monitor Application

```bash
# Monitor resource usage
pm2 monit

# View real-time logs
pm2 logs shakti --lines 50

# Restart application if needed
pm2 restart shakti
```

## 🧪 Step 6: Testing Your Deployment

### 6.1 Test Main Domain (SuperAdmin)

```bash
# Test HTTP access
curl -I http://yourdomain.com

# Test HTTPS access (if SSL configured)
curl -I https://yourdomain.com
```

### 6.2 Test Subdomain Access

```bash
# Test sample subdomains
curl -I http://techcorp.yourdomain.com
curl -I http://globallending.yourdomain.com
curl -I http://quickloans.yourdomain.com
```

### 6.3 Test Application Functionality

1. **Open browser and go to:** `http://yourdomain.com`
2. **Login as SuperAdmin** (use credentials from your app)
3. **Create a new tenant** with subdomain `test.yourdomain.com`
4. **Test tenant access:** `http://test.yourdomain.com`
5. **Verify tenant isolation** - ensure tenants can't access each other's data

## 🔧 Step 7: Troubleshooting

### Common Issues & Solutions

**Problem: Subdomains not working**
```bash
# Check DNS resolution
nslookup test.yourdomain.com

# Check Nginx configuration
sudo nginx -t
sudo systemctl reload nginx

# Check application logs
pm2 logs shakti
```

**Problem: Database connection failed**
```bash
# Test database connection
sudo -u postgres psql -d shakti_db

# Check if PostgreSQL is running
sudo systemctl status postgresql

# Verify DATABASE_URL in .env file
cat .env
```

**Problem: Application not starting**
```bash
# Check Node.js version
node --version

# Check if port 3000 is available
netstat -tulpn | grep :3000

# View detailed PM2 logs
pm2 logs shakti --lines 100
```

**Problem: SSL certificate issues**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Check Nginx SSL configuration
sudo nginx -t
```

## 📊 Step 8: Monitoring & Maintenance

### 8.1 Setup Log Rotation

```bash
# Create logrotate configuration
sudo nano /etc/logrotate.d/shakti
```

**Add to file:**
```
/opt/shakti/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
}
```

### 8.2 Monitor Resource Usage

```bash
# Check system resources
htop

# Check disk usage
df -h

# Check memory usage
free -h

# Monitor Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

### 8.3 Database Maintenance

```bash
# Backup database
sudo -u postgres pg_dump shakti_db > shakti_backup_$(date +%Y%m%d).sql

# Check database size
sudo -u postgres psql -d shakti_db -c "SELECT pg_size_pretty(pg_database_size('shakti_db'));"

# View active connections
sudo -u postgres psql -d shakti_db -c "SELECT * FROM pg_stat_activity;"
```

## 🚨 Emergency Commands

```bash
# Restart all services
sudo systemctl restart nginx postgresql

# Restart application
pm2 restart shakti

# Stop application
pm2 stop shakti

# View system status
sudo systemctl status nginx postgresql

# Check listening ports
sudo netstat -tulpn
```

## 📞 Support Commands

```bash
# Application status
pm2 status

# Application logs
pm2 logs shakti

# System resource usage
htop

# Network connections
sudo netstat -tulpn

# Service status
sudo systemctl status nginx postgresql
```

## 🎯 Next Steps After Deployment

1. **Test all functionality** - Create tenants, test subdomains, verify admin management
2. **Setup monitoring** - Consider using tools like Grafana, Prometheus
3. **Configure backups** - Automate daily database and file backups
4. **Setup alerts** - Monitor for downtime, high resource usage
5. **Performance optimization** - Database indexing, caching strategies
6. **Security hardening** - Fail2ban, additional firewall rules

## 🌐 Access URLs After Deployment

- **SuperAdmin Dashboard:** `http://yourdomain.com`
- **TechCorp Finance:** `http://techcorp.yourdomain.com`
- **Global Lending:** `http://globallending.yourdomain.com`
- **QuickLoans Ltd:** `http://quickloans.yourdomain.com`

## 💡 Tips for Success

1. **Always test on a staging environment first**
2. **Keep regular backups of your database**
3. **Monitor resource usage and scale when needed**
4. **Use strong passwords and keep them secure**
5. **Enable SSL certificates for security**
6. **Configure proper firewall rules**
7. **Keep your system and applications updated**

---

**🎉 Congratulations! Your Shakti Multi-Tenant SaaS is now live on Hostinger VPS!**

For technical support:
- Check PM2 logs: `pm2 logs shakti`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Check system logs: `sudo journalctl -u nginx -f`