import { Tenant } from '../types/tenant';
import { supabase } from '../lib/supabase';

export const extractSubdomain = (hostname: string): string => {
  const hostnameWithoutPort = hostname.split(':')[0];
  const parts = hostnameWithoutPort.split('.');

  if (hostnameWithoutPort === 'localhost' || hostnameWithoutPort.includes('127.0.0.1')) {
    if (parts.length > 1 && parts[1] === 'localhost') {
      return parts[0];
    }
    return '';
  }

  if (parts.length > 2) {
    return parts[0];
  }

  return '';
};

export const extractDomain = (hostname: string): string => {
  const hostnameWithoutPort = hostname.split(':')[0];
  const parts = hostnameWithoutPort.split('.');

  if (hostnameWithoutPort === 'localhost' || hostnameWithoutPort.includes('127.0.0.1')) {
    return hostnameWithoutPort;
  }

  if (parts.length >= 2) {
    return parts.slice(-2).join('.');
  }

  return hostnameWithoutPort;
};

export const isMainDomain = (hostname: string): boolean => {
  const subdomain = extractSubdomain(hostname);
  return !subdomain || subdomain === 'www';
};

export const getTenantIdentifier = (hostname: string): string | null => {
  if (isMainDomain(hostname)) {
    return null;
  }
  return extractSubdomain(hostname);
};

export const getTenantBySubdomain = async (subdomain: string): Promise<Tenant | null> => {
  const normalizedSubdomain = subdomain.toLowerCase().trim();

  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('subdomain', normalizedSubdomain)
    .maybeSingle();

  if (error) {
    console.error('Error fetching tenant by subdomain:', error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    subdomain: data.subdomain,
    status: data.status,
    proprietorName: data.proprietor_name,
    phoneNumber: data.phone_number,
    address: data.address,
    gstNumber: data.gst_number,
    plan: data.plan,
    maxUsers: data.max_users,
    maxConnections: data.max_connections,
    settings: data.settings || { branding: {}, features: {} },
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    createdBy: data.created_by
  };
};

export const getAllTenants = async (): Promise<Tenant[]> => {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all tenants:', error);
    return [];
  }

  return data.map((item: any) => ({
    id: item.id,
    name: item.name,
    subdomain: item.subdomain,
    status: item.status,
    proprietorName: item.proprietor_name,
    phoneNumber: item.phone_number,
    address: item.address,
    gstNumber: item.gst_number,
    plan: item.plan,
    maxUsers: item.max_users,
    maxConnections: item.max_connections,
    settings: item.settings || { branding: {}, features: {} },
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at),
    createdBy: item.created_by
  }));
};

export const createTenant = async (tenantData: Omit<Tenant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tenant> => {
  const { data, error } = await supabase
    .from('tenants')
    .insert({
      name: tenantData.name,
      subdomain: tenantData.subdomain.toLowerCase(),
      status: tenantData.status,
      proprietor_name: tenantData.proprietorName,
      phone_number: tenantData.phoneNumber,
      address: tenantData.address,
      gst_number: tenantData.gstNumber,
      plan: tenantData.plan || 'basic',
      max_users: tenantData.maxUsers || 10,
      max_connections: tenantData.maxConnections || 5,
      settings: tenantData.settings,
      created_by: tenantData.createdBy
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating tenant:', error);
    if (error.code === '23505') {
      throw new Error('A tenant with this subdomain already exists');
    }
    if (error.code === '23503') {
      throw new Error('Invalid super admin reference. Please log in again.');
    }
    throw new Error(error.message || 'Failed to create tenant');
  }

  return {
    id: data.id,
    name: data.name,
    subdomain: data.subdomain,
    status: data.status,
    proprietorName: data.proprietor_name,
    phoneNumber: data.phone_number,
    address: data.address,
    gstNumber: data.gst_number,
    plan: data.plan,
    maxUsers: data.max_users,
    maxConnections: data.max_connections,
    settings: data.settings,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    createdBy: data.created_by
  };
};

export const updateTenant = async (tenantId: string, updates: Partial<Tenant>): Promise<Tenant> => {
  const updateData: any = {};

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.subdomain !== undefined) updateData.subdomain = updates.subdomain.toLowerCase();
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.proprietorName !== undefined) updateData.proprietor_name = updates.proprietorName;
  if (updates.phoneNumber !== undefined) updateData.phone_number = updates.phoneNumber;
  if (updates.address !== undefined) updateData.address = updates.address;
  if (updates.gstNumber !== undefined) updateData.gst_number = updates.gstNumber;
  if (updates.plan !== undefined) updateData.plan = updates.plan;
  if (updates.maxUsers !== undefined) updateData.max_users = updates.maxUsers;
  if (updates.maxConnections !== undefined) updateData.max_connections = updates.maxConnections;
  if (updates.settings !== undefined) updateData.settings = updates.settings;

  const { data, error } = await supabase
    .from('tenants')
    .update(updateData)
    .eq('id', tenantId)
    .select()
    .single();

  if (error) {
    console.error('Error updating tenant:', error);
    throw new Error('Failed to update tenant');
  }

  return {
    id: data.id,
    name: data.name,
    subdomain: data.subdomain,
    status: data.status,
    proprietorName: data.proprietor_name,
    phoneNumber: data.phone_number,
    address: data.address,
    gstNumber: data.gst_number,
    plan: data.plan,
    maxUsers: data.max_users,
    maxConnections: data.max_connections,
    settings: data.settings,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    createdBy: data.created_by
  };
};

export const deleteTenant = async (tenantId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('tenants')
    .delete()
    .eq('id', tenantId);

  if (error) {
    console.error('Error deleting tenant:', error);
    throw new Error('Failed to delete tenant');
  }

  return true;
};