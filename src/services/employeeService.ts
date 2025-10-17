import { supabase } from '../lib/supabase';
import bcrypt from 'bcryptjs';
import type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '../types/employee';

export const employeeService = {
  async getEmployees(tenantId: string, roleFilter?: string): Promise<Employee[]> {
    try {
      let query = supabase
        .from('employees')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (roleFilter && roleFilter !== 'All') {
        query = query.eq('role', roleFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching employees:', error);
        throw new Error(error.message);
      }

      return (data || []).map(emp => ({
        id: emp.id,
        tenantId: emp.tenant_id,
        name: emp.name,
        mobile: emp.mobile,
        empId: emp.emp_id,
        role: emp.role,
        status: emp.status,
        createdAt: new Date(emp.created_at),
        updatedAt: new Date(emp.updated_at),
        createdBy: emp.created_by,
      }));
    } catch (error) {
      console.error('Error in getEmployees:', error);
      throw error;
    }
  },

  async createEmployee(tenantId: string, createdBy: string, employeeData: CreateEmployeeRequest): Promise<Employee> {
    try {
      const passwordHash = await bcrypt.hash(employeeData.password, 10);

      const { data, error } = await supabase
        .from('employees')
        .insert({
          tenant_id: tenantId,
          name: employeeData.name,
          mobile: employeeData.mobile,
          emp_id: employeeData.empId,
          password_hash: passwordHash,
          role: employeeData.role,
          status: 'active',
          created_by: createdBy,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating employee:', error);
        throw new Error(error.message);
      }

      return {
        id: data.id,
        tenantId: data.tenant_id,
        name: data.name,
        mobile: data.mobile,
        empId: data.emp_id,
        role: data.role,
        status: data.status,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        createdBy: data.created_by,
      };
    } catch (error) {
      console.error('Error in createEmployee:', error);
      throw error;
    }
  },

  async updateEmployee(employeeId: string, updates: UpdateEmployeeRequest): Promise<Employee> {
    try {
      const updateData: any = {};

      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.mobile !== undefined) updateData.mobile = updates.mobile;
      if (updates.empId !== undefined) updateData.emp_id = updates.empId;
      if (updates.role !== undefined) updateData.role = updates.role;

      const { data, error } = await supabase
        .from('employees')
        .update(updateData)
        .eq('id', employeeId)
        .select()
        .single();

      if (error) {
        console.error('Error updating employee:', error);
        throw new Error(error.message);
      }

      return {
        id: data.id,
        tenantId: data.tenant_id,
        name: data.name,
        mobile: data.mobile,
        empId: data.emp_id,
        role: data.role,
        status: data.status,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        createdBy: data.created_by,
      };
    } catch (error) {
      console.error('Error in updateEmployee:', error);
      throw error;
    }
  },

  async deleteEmployee(employeeId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId);

      if (error) {
        console.error('Error deleting employee:', error);
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      console.error('Error in deleteEmployee:', error);
      throw error;
    }
  },

  async resetEmployeePassword(employeeId: string): Promise<string> {
    try {
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      const { error } = await supabase
        .from('employees')
        .update({ password_hash: passwordHash })
        .eq('id', employeeId);

      if (error) {
        console.error('Error resetting password:', error);
        throw new Error(error.message);
      }

      return tempPassword;
    } catch (error) {
      console.error('Error in resetEmployeePassword:', error);
      throw error;
    }
  },

  async toggleEmployeeStatus(employeeId: string, currentStatus: string): Promise<Employee> {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

      const { data, error } = await supabase
        .from('employees')
        .update({ status: newStatus })
        .eq('id', employeeId)
        .select()
        .single();

      if (error) {
        console.error('Error toggling employee status:', error);
        throw new Error(error.message);
      }

      return {
        id: data.id,
        tenantId: data.tenant_id,
        name: data.name,
        mobile: data.mobile,
        empId: data.emp_id,
        role: data.role,
        status: data.status,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        createdBy: data.created_by,
      };
    } catch (error) {
      console.error('Error in toggleEmployeeStatus:', error);
      throw error;
    }
  },
};
