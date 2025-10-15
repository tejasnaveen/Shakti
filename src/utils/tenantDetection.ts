import { Tenant } from '../types/tenant';

/**
 * Extract subdomain from hostname
 * @param hostname - The current hostname (e.g., 'company1.yourapp.com')
 * @returns The subdomain part (e.g., 'company1')
 */
export const extractSubdomain = (hostname: string): string => {
  // Remove port if present
  const hostnameWithoutPort = hostname.split(':')[0];

  // Split hostname into parts
  const parts = hostnameWithoutPort.split('.');

  // For localhost development
  if (hostnameWithoutPort === 'localhost' || hostnameWithoutPort.includes('127.0.0.1')) {
    // Check for custom localhost subdomain (e.g., company1.localhost)
    if (parts.length > 1 && parts[1] === 'localhost') {
      return parts[0];
    }
    return '';
  }

  // For production domains
  // If we have more than 2 parts (subdomain.domain.com), return the first part
  if (parts.length > 2) {
    return parts[0];
  }

  return '';
};

/**
 * Get the full domain from hostname
 * @param hostname - The current hostname
 * @returns The domain part (e.g., 'yourapp.com')
 */
export const extractDomain = (hostname: string): string => {
  const hostnameWithoutPort = hostname.split(':')[0];
  const parts = hostnameWithoutPort.split('.');

  // For localhost
  if (hostnameWithoutPort === 'localhost' || hostnameWithoutPort.includes('127.0.0.1')) {
    return hostnameWithoutPort;
  }

  // For production, return the last two parts (domain.com)
  if (parts.length >= 2) {
    return parts.slice(-2).join('.');
  }

  return hostnameWithoutPort;
};

/**
 * Check if current request is from main domain (superadmin)
 * @param hostname - The current hostname
 * @returns Boolean indicating if this is the main domain
 */
export const isMainDomain = (hostname: string): boolean => {
  const subdomain = extractSubdomain(hostname);
  return !subdomain || subdomain === 'www';
};

/**
 * Get tenant identifier from subdomain
 * @param hostname - The current hostname
 * @returns Tenant identifier (subdomain or null for main domain)
 */
export const getTenantIdentifier = (hostname: string): string | null => {
  if (isMainDomain(hostname)) {
    return null; // Main domain - superadmin access
  }
  return extractSubdomain(hostname);
};

/**
 * Mock tenant database - In production, this would be a real database call
 * This simulates the tenant lookup based on subdomain
 */
const MOCK_TENANT_DATABASE: Record<string, Tenant> = {
  'techcorp': {
    id: 'tenant_1',
    name: 'TechCorp Finance',
    subdomain: 'techcorp',
    status: 'active',
    proprietorName: 'Rajesh Kumar',
    phoneNumber: '+91-9876543210',
    address: '123 Business District, Mumbai, Maharashtra 400001',
    gstNumber: '27AABCT1234F1Z5',
    settings: {
      branding: {
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF'
      },
      features: {
        voip: true,
        sms: true,
        analytics: true,
        apiAccess: true
      }
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'superadmin_1'
  },
  'globallending': {
    id: 'tenant_2',
    name: 'Global Lending Solutions',
    subdomain: 'globallending',
    status: 'active',
    proprietorName: 'Priya Sharma',
    phoneNumber: '+91-9876543211',
    address: '456 Finance Street, Delhi, Delhi 110001',
    gstNumber: '07AABCG5678F1Z3',
    settings: {
      branding: {
        primaryColor: '#10B981',
        secondaryColor: '#059669'
      },
      features: {
        voip: true,
        sms: false,
        analytics: true,
        apiAccess: false
      }
    },
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
    createdBy: 'superadmin_1'
  },
  'quickloans': {
    id: 'tenant_3',
    name: 'QuickLoans Ltd',
    subdomain: 'quickloans',
    status: 'active',
    proprietorName: 'Amit Patel',
    phoneNumber: '+91-9876543212',
    address: '789 Loan Avenue, Ahmedabad, Gujarat 380001',
    gstNumber: '24AABCH9012F1Z8',
    settings: {
      branding: {
        primaryColor: '#F59E0B',
        secondaryColor: '#D97706'
      },
      features: {
        voip: false,
        sms: false,
        analytics: false,
        apiAccess: false
      }
    },
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15'),
    createdBy: 'superadmin_1'
  }
};

/**
 * Get tenant by subdomain
 * @param subdomain - The subdomain to look up
 * @returns Promise<Tenant | null> - The tenant data or null if not found
 */
export const getTenantBySubdomain = async (subdomain: string): Promise<Tenant | null> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Normalize subdomain (lowercase, trim)
  const normalizedSubdomain = subdomain.toLowerCase().trim();

  return MOCK_TENANT_DATABASE[normalizedSubdomain] || null;
};

/**
 * Get all tenants (for superadmin)
 * @returns Promise<Tenant[]> - All tenants
 */
export const getAllTenants = async (): Promise<Tenant[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 200));

  return Object.values(MOCK_TENANT_DATABASE);
};

/**
 * Create new tenant
 * @param tenantData - The tenant data to create
 * @returns Promise<Tenant> - The created tenant
 */
export const createTenant = async (tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const newTenant: Tenant = {
    ...tenantData,
    id: `tenant_${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // In production, this would save to database
  MOCK_TENANT_DATABASE[tenantData.subdomain] = newTenant;

  return newTenant;
};

/**
 * Update tenant
 * @param tenantId - The tenant ID to update
 * @param updates - The updates to apply
 * @returns Promise<Tenant> - The updated tenant
 */
export const updateTenant = async (tenantId: string, updates: Partial<Tenant>): Promise<Tenant> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 200));

  // Find tenant by ID
  const tenant = Object.values(MOCK_TENANT_DATABASE).find(t => t.id === tenantId);
  if (!tenant) {
    throw new Error('Tenant not found');
  }

  const updatedTenant = {
    ...tenant,
    ...updates,
    updatedAt: new Date()
  };

  // Update in mock database
  MOCK_TENANT_DATABASE[tenant.subdomain] = updatedTenant;

  return updatedTenant;
};

/**
 * Delete tenant
 * @param tenantId - The tenant ID to delete
 * @returns Promise<boolean> - Success status
 */
export const deleteTenant = async (tenantId: string): Promise<boolean> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 200));

  // Find tenant by ID
  const tenant = Object.values(MOCK_TENANT_DATABASE).find(t => t.id === tenantId);
  if (!tenant) {
    throw new Error('Tenant not found');
  }

  // Remove from mock database
  delete MOCK_TENANT_DATABASE[tenant.subdomain];

  return true;
};