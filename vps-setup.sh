#!/bin/bash

# Shakti VPS Quick Setup Script for Hostinger
# Run this script on your Hostinger VPS

set -e

# Configuration - UPDATE THESE VALUES
DOMAIN="yourdomain.com"  # Replace with your actual domain
DB_PASSWORD="your_secure_password_here"  # Generate a strong password

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   log_error "This script should not be run as root"
   exit 1
fi

log_info "🚀 Starting Shakti VPS Setup..."

# Update system
log_info "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js
log_info "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx
log_info "Installing Nginx..."
sudo apt install -y nginx

# Install PM2
log_info "Installing PM2..."
sudo npm install -g pm2

# Install PostgreSQL
log_info "Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Start services
log_info "Starting services..."
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl start nginx
sudo systemctl enable nginx

# Setup database
log_info "Setting up database..."
sudo -u postgres psql << EOF
CREATE DATABASE shakti_db;
CREATE USER shakti_user WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE shakti_db TO shakti_user;
ALTER USER shakti_user CREATEDB;
EOF

# Setup firewall
log_info "Configuring firewall..."
sudo ufw allow 'OpenSSH'
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Create application directory
log_info "Creating application directory..."
sudo mkdir -p /opt/shakti
sudo chown -R $USER:$USER /opt/shakti

log_success "✅ VPS setup completed!"
log_info ""
log_warn "📋 Next steps:"
log_warn "1. Upload your project files to /opt/shakti"
log_warn "2. Configure DNS wildcard record (*.$DOMAIN) to point to this VPS"
log_warn "3. Run the deployment script: cd /opt/shakti && chmod +x deploy.sh && ./deploy.sh"
log_warn "4. Update .env file with your domain and database password"
log_info ""
log_info "🌐 Your VPS IP address:"
curl -s http://icanhazip.com
log_info ""
log_info "📊 Database credentials:"
log_info "   Database: shakti_db"
log_info "   User: shakti_user"
log_info "   Password: $DB_PASSWORD"
log_warn "⚠️  Save these credentials securely!"