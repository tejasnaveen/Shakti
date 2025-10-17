import { supabase } from '../lib/supabase';
import { comparePassword } from '../utils/passwordUtils';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthenticatedUser {
  id: string;
  username: string;
  tenantId?: string;
  email?: string;
  name?: string;
  role?: string;
}

export const loginSuperAdmin = async (credentials: LoginCredentials): Promise<AuthenticatedUser> => {
  const { username, password } = credentials;

  console.log('Attempting login with username:', username);

  const { data, error } = await supabase
    .from('super_admins')
    .select('id, username, password_hash')
    .eq('username', username)
    .maybeSingle();

  console.log('Query result:', { data, error });

  if (error) {
    console.error('Database error:', error);
    throw new Error('Authentication failed');
  }

  if (!data) {
    console.log('No user found with username:', username);
    throw new Error('Invalid username or password');
  }

  console.log('Found user, comparing password...');
  const isPasswordValid = await comparePassword(password, data.password_hash);
  console.log('Password valid:', isPasswordValid);

  if (!isPasswordValid) {
    throw new Error('Invalid username or password');
  }

  return {
    id: data.id,
    username: data.username
  };
};

export const loginCompanyAdmin = async (credentials: LoginCredentials, tenantId: string): Promise<AuthenticatedUser> => {
  const { username, password } = credentials;

  console.log('Attempting CompanyAdmin login with username:', username, 'tenantId:', tenantId);

  const { data, error } = await supabase
    .from('company_admins')
    .select('id, username, email, password_hash, tenant_id')
    .eq('username', username)
    .eq('tenant_id', tenantId)
    .maybeSingle();

  console.log('CompanyAdmin query result:', { data, error });

  if (error) {
    console.error('Database error:', error);
    throw new Error('Authentication failed');
  }

  if (!data) {
    console.log('No company admin found with username:', username);
    throw new Error('Invalid username or password');
  }

  console.log('Found company admin, comparing password...');
  const isPasswordValid = await comparePassword(password, data.password_hash);
  console.log('Password valid:', isPasswordValid);

  if (!isPasswordValid) {
    throw new Error('Invalid username or password');
  }

  return {
    id: data.id,
    username: data.username,
    email: data.email,
    name: data.username,
    tenantId: data.tenant_id,
    role: 'CompanyAdmin'
  };
};

export const loginEmployee = async (credentials: { identifier: string; password: string }, tenantId: string): Promise<AuthenticatedUser> => {
  const { identifier, password } = credentials;

  console.log('Attempting Employee login with identifier:', identifier, 'tenantId:', tenantId);

  const { data, error } = await supabase
    .from('employees')
    .select('id, name, mobile, emp_id, password_hash, role, tenant_id, status')
    .eq('tenant_id', tenantId)
    .or(`mobile.eq.${identifier},emp_id.eq.${identifier}`)
    .maybeSingle();

  console.log('Employee query result:', { data, error });

  if (error) {
    console.error('Database error:', error);
    throw new Error('Authentication failed');
  }

  if (!data) {
    console.log('No employee found with identifier:', identifier);
    throw new Error('Invalid credentials');
  }

  if (data.status !== 'active') {
    throw new Error('Your account is inactive. Please contact your administrator.');
  }

  console.log('Found employee, comparing password...');
  const isPasswordValid = await comparePassword(password, data.password_hash);
  console.log('Password valid:', isPasswordValid);

  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  return {
    id: data.id,
    username: data.emp_id,
    name: data.name,
    email: data.mobile,
    tenantId: data.tenant_id,
    role: data.role
  };
};
