import { supabase } from '../lib/supabase';

export interface ColumnConfiguration {
  id?: string;
  tenant_id: string;
  column_name: string;
  display_name: string;
  is_active: boolean;
  is_custom: boolean;
  column_order: number;
  data_type: string;
}

export const columnConfigService = {
  async getColumnConfigurations(tenantId: string): Promise<ColumnConfiguration[]> {
    const { data, error } = await supabase
      .from('column_configurations')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('column_order', { ascending: true });

    if (error) {
      console.error('Error fetching column configurations:', error);
      throw new Error('Failed to fetch column configurations');
    }

    return data || [];
  },

  async getActiveColumnConfigurations(tenantId: string): Promise<ColumnConfiguration[]> {
    const { data, error } = await supabase
      .from('column_configurations')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .order('column_order', { ascending: true });

    if (error) {
      console.error('Error fetching active column configurations:', error);
      throw new Error('Failed to fetch active column configurations');
    }

    return data || [];
  },

  async saveColumnConfigurations(
    tenantId: string,
    columns: Omit<ColumnConfiguration, 'id' | 'tenant_id'>[]
  ): Promise<void> {
    const { error: deleteError } = await supabase
      .from('column_configurations')
      .delete()
      .eq('tenant_id', tenantId);

    if (deleteError) {
      console.error('Error deleting old configurations:', deleteError);
      throw new Error('Failed to delete old configurations');
    }

    const columnsWithTenantId = columns.map(col => ({
      ...col,
      tenant_id: tenantId
    }));

    const { error: insertError } = await supabase
      .from('column_configurations')
      .insert(columnsWithTenantId);

    if (insertError) {
      console.error('Error saving column configurations:', insertError);
      throw new Error('Failed to save column configurations');
    }
  },

  async initializeDefaultColumns(tenantId: string): Promise<void> {
    const existingConfig = await this.getColumnConfigurations(tenantId);

    if (existingConfig.length > 0) {
      return;
    }

    const defaultColumns: Omit<ColumnConfiguration, 'id' | 'tenant_id'>[] = [
      { column_name: 'customerName', display_name: 'Customer Name', is_active: true, is_custom: false, column_order: 1, data_type: 'text' },
      { column_name: 'loanId', display_name: 'Loan ID', is_active: true, is_custom: false, column_order: 2, data_type: 'text' },
      { column_name: 'loanAmount', display_name: 'Loan Amount', is_active: true, is_custom: false, column_order: 3, data_type: 'currency' },
      { column_name: 'mobileNo', display_name: 'Mobile No', is_active: true, is_custom: false, column_order: 4, data_type: 'phone' },
      { column_name: 'dpd', display_name: 'DPD', is_active: true, is_custom: false, column_order: 5, data_type: 'number' },
      { column_name: 'outstandingAmount', display_name: 'Outstanding Amount', is_active: true, is_custom: false, column_order: 6, data_type: 'currency' },
      { column_name: 'posAmount', display_name: 'POS Amount', is_active: true, is_custom: false, column_order: 7, data_type: 'currency' },
      { column_name: 'emiAmount', display_name: 'EMI Amount', is_active: true, is_custom: false, column_order: 8, data_type: 'currency' },
      { column_name: 'pendingDues', display_name: 'Pending Dues', is_active: true, is_custom: false, column_order: 9, data_type: 'currency' },
      { column_name: 'address', display_name: 'Address', is_active: true, is_custom: false, column_order: 10, data_type: 'text' },
      { column_name: 'sanctionDate', display_name: 'Sanction Date', is_active: true, is_custom: false, column_order: 11, data_type: 'date' },
      { column_name: 'lastPaidAmount', display_name: 'Last Paid Amount', is_active: true, is_custom: false, column_order: 12, data_type: 'currency' },
      { column_name: 'lastPaidDate', display_name: 'Last Paid Date', is_active: true, is_custom: false, column_order: 13, data_type: 'date' },
      { column_name: 'paymentLink', display_name: 'Payment Link', is_active: true, is_custom: false, column_order: 14, data_type: 'url' },
      { column_name: 'branchName', display_name: 'Branch Name', is_active: true, is_custom: false, column_order: 15, data_type: 'text' },
      { column_name: 'loanType', display_name: 'Loan Type', is_active: true, is_custom: false, column_order: 16, data_type: 'text' },
      { column_name: 'remarks', display_name: 'Remarks', is_active: false, is_custom: false, column_order: 17, data_type: 'text' }
    ];

    await this.saveColumnConfigurations(tenantId, defaultColumns);
  }
};
