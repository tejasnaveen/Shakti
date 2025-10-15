import { CompanyAdmin, CreateAdminRequest, UpdateAdminRequest } from '../types/admin';

// Simple hash function for demo purposes - in production, use bcrypt
const hashPassword = async (password: string): Promise<string> => {
  // Simple hash for demo - in production use proper bcrypt
  return `hashed_${password}_${Date.now()}`;
};

// Mock admin database - In production, this would be a real database
const MOCK_ADMIN_DATABASE: Record<string, CompanyAdmin> = {
  'admin_1': {
    id: 'admin_1',
    tenantId: 'tenant_1',
    name: 'Rajesh Kumar',
    employeeId: 'EMP001',
    email: 'rajesh.kumar@techcorp.com',
    status: 'active',
    role: 'CompanyAdmin',
    lastLoginAt: new Date('2024-01-15T10:30:00Z'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'superadmin_1'
  },
  'admin_2': {
    id: 'admin_2',
    tenantId: 'tenant_2',
    name: 'Priya Sharma',
    employeeId: 'EMP002',
    email: 'priya.sharma@globallending.com',
    status: 'active',
    role: 'CompanyAdmin',
    lastLoginAt: new Date('2024-01-14T15:45:00Z'),
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
    createdBy: 'superadmin_1'
  },
  'admin_3': {
    id: 'admin_3',
    tenantId: 'tenant_3',
    name: 'Amit Patel',
    employeeId: 'EMP003',
    email: 'amit.patel@quickloans.com',
    status: 'inactive',
    role: 'CompanyAdmin',
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-13'),
    createdBy: 'superadmin_1'
  }
};

/**
 * Get all admins for a specific tenant
 */
export const getAdminsByTenantId = async (tenantId: string): Promise<CompanyAdmin[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100));

  return Object.values(MOCK_ADMIN_DATABASE).filter(admin => admin.tenantId === tenantId);
};

/**
 * Get admin by ID
 */
export const getAdminById = async (adminId: string): Promise<CompanyAdmin | null> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 100));

  return MOCK_ADMIN_DATABASE[adminId] || null;
};

/**
 * Create new company admin
 */
export const createAdmin = async (tenantId: string, adminData: CreateAdminRequest): Promise<CompanyAdmin> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Hash password
  const passwordHash = await hashPassword(adminData.password);

  const newAdmin: CompanyAdmin = {
    id: `admin_${Date.now()}`,
    tenantId,
    name: adminData.name,
    employeeId: adminData.employeeId,
    email: adminData.email,
    passwordHash,
    status: adminData.status || 'active',
    role: 'CompanyAdmin',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'superadmin_1'
  };

  MOCK_ADMIN_DATABASE[newAdmin.id] = newAdmin;
  return newAdmin;
};

/**
 * Update company admin
 */
export const updateAdmin = async (adminId: string, updates: UpdateAdminRequest): Promise<CompanyAdmin> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 200));

  const admin = MOCK_ADMIN_DATABASE[adminId];
  if (!admin) {
    throw new Error('Admin not found');
  }

  const updatedAdmin = {
    ...admin,
    ...updates,
    updatedAt: new Date()
  };

  MOCK_ADMIN_DATABASE[adminId] = updatedAdmin;
  return updatedAdmin;
};

/**
 * Delete company admin
 */
export const deleteAdmin = async (adminId: string): Promise<boolean> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 200));

  if (!MOCK_ADMIN_DATABASE[adminId]) {
    throw new Error('Admin not found');
  }

  delete MOCK_ADMIN_DATABASE[adminId];
  return true;
};

/**
 * Reset admin password
 */
export const resetAdminPassword = async (adminId: string): Promise<string> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 200));

  const admin = MOCK_ADMIN_DATABASE[adminId];
  if (!admin) {
    throw new Error('Admin not found');
  }

  // Generate temporary password
  const tempPassword = `TempPass${Math.random().toString(36).slice(-6)}!`;

  // Hash new password
  const passwordHash = await hashPassword(tempPassword);

  // Update admin with new password
  admin.passwordHash = passwordHash;
  admin.passwordResetToken = undefined;
  admin.passwordResetExpires = undefined;
  admin.updatedAt = new Date();

  MOCK_ADMIN_DATABASE[adminId] = admin;
  return tempPassword;
};

/**
 * Toggle admin status (active/inactive)
 */
export const toggleAdminStatus = async (adminId: string): Promise<CompanyAdmin> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 150));

  const admin = MOCK_ADMIN_DATABASE[adminId];
  if (!admin) {
    throw new Error('Admin not found');
  }

  const updatedAdmin: CompanyAdmin = {
    ...admin,
    status: admin.status === 'active' ? 'inactive' : 'active',
    updatedAt: new Date()
  };

  MOCK_ADMIN_DATABASE[adminId] = updatedAdmin;
  return updatedAdmin;
};

/**
 * Validate employee ID uniqueness within tenant
 */
export const isEmployeeIdUnique = async (tenantId: string, employeeId: string, excludeAdminId?: string): Promise<boolean> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 50));

  const tenantAdmins = Object.values(MOCK_ADMIN_DATABASE).filter(
    admin => admin.tenantId === tenantId && admin.id !== excludeAdminId
  );

  return !tenantAdmins.some(admin => admin.employeeId === employeeId);
};

/**
 * Validate email uniqueness within tenant
 */
export const isEmailUnique = async (tenantId: string, email: string, excludeAdminId?: string): Promise<boolean> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 50));

  const tenantAdmins = Object.values(MOCK_ADMIN_DATABASE).filter(
    admin => admin.tenantId === tenantId && admin.id !== excludeAdminId
  );

  return !tenantAdmins.some(admin => admin.email === email);
};