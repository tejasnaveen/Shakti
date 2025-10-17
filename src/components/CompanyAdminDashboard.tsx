import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { Home, Users, FileText, BarChart3, Settings, TrendingUp, DollarSign, Phone, Clock, Plus, Edit, Trash2, Key, Shield, ShieldOff, UserPlus, UserMinus, X, Save, Eye, EyeOff, CheckCircle, Columns, CircleDot as DragHandleDots2, Download } from 'lucide-react';
import { employeeService } from '../services/employeeService';
import type { Employee, EmployeeFormData, EmployeeRole } from '../types/employee';

interface CompanyAdminDashboardProps {
  user: any;
  onLogout: () => void;
}

const CompanyAdminDashboard: React.FC<CompanyAdminDashboardProps> = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showPreview, setShowPreview] = useState(false);
  const [columns, setColumns] = useState([
    { columnName: 'customerName', displayName: 'Customer Name', isActive: true },
    { columnName: 'loanId', displayName: 'Loan ID', isActive: true },
    { columnName: 'loanAmount', displayName: 'Loan Amount', isActive: true },
    { columnName: 'mobileNo', displayName: 'Mobile No', isActive: true },
    { columnName: 'dpd', displayName: 'DPD', isActive: true },
    { columnName: 'outstanding', displayName: 'Outstanding', isActive: true },
    { columnName: 'posAmount', displayName: 'POS Amount', isActive: true },
    { columnName: 'emiAmount', displayName: 'EMI Amount', isActive: true },
    { columnName: 'pendingDues', displayName: 'Pending Dues', isActive: true },
    { columnName: 'paymentLink', displayName: 'Payment Link', isActive: true },
    { columnName: 'branchName', displayName: 'Branch Name', isActive: true },
    { columnName: 'loanType', displayName: 'Loan Type', isActive: true },
    { columnName: 'actions', displayName: 'Actions', isActive: true }
  ]);
  const [customColumns, setCustomColumns] = useState([]);
  const [newCustomColumn, setNewCustomColumn] = useState({
    columnName: '',
    displayName: '',
    isActive: true
  });
  const [activeReportTab, setActiveReportTab] = useState('daily');
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(false);
  const [tempPassword, setTempPassword] = useState<string>('');
  const [showTempPasswordModal, setShowTempPasswordModal] = useState(false);

  const [employeeFormData, setEmployeeFormData] = useState<EmployeeFormData>({
    name: '',
    mobile: '',
    empId: '',
    password: '',
    role: 'Telecaller',
  });

  // Sample data - keeping for other sections
  const [teamIncharges, setTeamIncharges] = useState([
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@company.com',
      mobile: '+91 98765 43210',
      assignedTelecallers: 8,
      status: 'Active',
      joiningDate: '2023-01-15',
      teamName: 'Recovery Team A'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      mobile: '+91 98765 43211',
      assignedTelecallers: 6,
      status: 'Active',
      joiningDate: '2023-02-20',
      teamName: 'Recovery Team B'
    },
    {
      id: 3,
      name: 'Mike Davis',
      email: 'mike.davis@company.com',
      mobile: '+91 98765 43212',
      assignedTelecallers: 7,
      status: 'Inactive',
      joiningDate: '2023-03-10',
      teamName: 'Recovery Team C'
    }
  ]);

  const [telecallers, setTelecallers] = useState([
    {
      id: 1,
      name: 'Amit Kumar',
      mobile: '+91 98765 43220',
      email: 'amit.kumar@company.com',
      assignedIncharge: 'John Smith',
      assignedInchargeId: 1,
      status: 'Active',
      joiningDate: '2023-06-15',
      teamName: 'Recovery Team A'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      mobile: '+91 98765 43221',
      email: 'priya.sharma@company.com',
      assignedIncharge: 'John Smith',
      assignedInchargeId: 1,
      status: 'Active',
      joiningDate: '2023-07-20',
      teamName: 'Recovery Team A'
    },
    {
      id: 3,
      name: 'Rohit Singh',
      mobile: '+91 98765 43222',
      email: 'rohit.singh@company.com',
      assignedIncharge: 'Sarah Johnson',
      assignedInchargeId: 2,
      status: 'Active',
      joiningDate: '2023-08-10',
      teamName: 'Recovery Team B'
    },
    {
      id: 4,
      name: 'Sunita Patel',
      mobile: '+91 98765 43223',
      email: 'sunita.patel@company.com',
      assignedIncharge: 'Sarah Johnson',
      assignedInchargeId: 2,
      status: 'Inactive',
      joiningDate: '2023-09-05',
      teamName: 'Recovery Team B'
    }
  ]);

  const [teams, setTeams] = useState([
    {
      id: 1,
      name: 'Recovery Team A',
      description: 'High-priority loan recovery team focusing on commercial loans',
      teamIncharge: 'John Smith',
      teamInchargeId: 1,
      telecallers: ['Amit Kumar', 'Priya Sharma'],
      telecallerIds: [1, 2],
      status: 'Active',
      createdDate: '2023-01-15'
    },
    {
      id: 2,
      name: 'Recovery Team B',
      description: 'Personal loan recovery team with focus on retail customers',
      teamIncharge: 'Sarah Johnson',
      teamInchargeId: 2,
      telecallers: ['Rohit Singh', 'Sunita Patel'],
      telecallerIds: [3, 4],
      status: 'Active',
      createdDate: '2023-02-20'
    },
    {
      id: 3,
      name: 'Recovery Team C',
      description: 'Specialized team for high-value defaulters',
      teamIncharge: 'Mike Davis',
      teamInchargeId: 3,
      telecallers: [],
      telecallerIds: [],
      status: 'Inactive',
      createdDate: '2023-03-10'
    }
  ]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    mobile: '',
    password: '',
    assignedInchargeId: '',
    teamName: '',
    description: '',
    teamInchargeId: '',
    selectedTelecallers: []
  });

  const toggleColumn = (index, isActive) => {
    const updatedColumns = [...columns];
    updatedColumns[index].isActive = isActive;
    setColumns(updatedColumns);
  };

  const updateColumnName = (index, displayName) => {
    const updatedColumns = [...columns];
    updatedColumns[index].displayName = displayName;
    setColumns(updatedColumns);
  };

  const toggleCustomColumn = (index, isActive) => {
    const updatedColumns = [...customColumns];
    updatedColumns[index].isActive = isActive;
    setCustomColumns(updatedColumns);
  };

  const addCustomColumn = () => {
    if (newCustomColumn.columnName && newCustomColumn.displayName) {
      setCustomColumns([...customColumns, { ...newCustomColumn }]);
      setNewCustomColumn({ columnName: '', displayName: '', isActive: true });
    }
  };

  const removeCustomColumn = (index) => {
    const updatedColumns = customColumns.filter((_, i) => i !== index);
    setCustomColumns(updatedColumns);
  };

  const getActiveColumns = () => {
    const activeDefaults = columns.filter(col => col.isActive);
    const activeCustoms = customColumns.filter(col => col.isActive);
    return [...activeDefaults, ...activeCustoms];
  };

  const saveColumnConfiguration = () => {
    // In a real app, this would save to backend
    const config = {
      columns,
      customColumns,
      timestamp: new Date().toISOString()
    };
    console.log('Saving configuration:', config);
    // Show success message
    alert('Column configuration saved successfully!');
  };

  const menuItems = [
    { name: 'Dashboard', icon: Home, active: activeSection === 'dashboard', onClick: () => setActiveSection('dashboard') },
    { name: 'Employee Management', icon: Users, active: activeSection === 'employee-management', onClick: () => setActiveSection('employee-management') },
    { name: 'Column Management', icon: Columns, active: activeSection === 'column-management', onClick: () => setActiveSection('column-management') },
    { name: 'Cases', icon: FileText, active: activeSection === 'cases', onClick: () => setActiveSection('cases') },
    { name: 'Reports', icon: FileText, active: activeSection === 'reports', onClick: () => setActiveSection('reports') },
    { name: 'Settings', icon: Settings, active: activeSection === 'settings', onClick: () => setActiveSection('settings') },
  ];

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      mobile: '',
      password: '',
      assignedInchargeId: '',
      teamName: '',
      description: '',
      teamInchargeId: '',
      selectedTelecallers: []
    });
  };

  const handleAddTeamIncharge = (e: React.FormEvent) => {
    e.preventDefault();
    const newTeamIncharge = {
      id: teamIncharges.length + 1,
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      assignedTelecallers: 0,
      status: 'Active',
      joiningDate: new Date().toISOString().split('T')[0],
      teamName: 'Unassigned'
    };
    setTeamIncharges([...teamIncharges, newTeamIncharge]);
    setShowAddTeamInchargeModal(false);
    resetForm();
  };

  const handleEditTeamIncharge = (e: React.FormEvent) => {
    e.preventDefault();
    setTeamIncharges(teamIncharges.map(ti => 
      ti.id === editingTeamIncharge.id 
        ? { ...ti, name: formData.name, email: formData.email, mobile: formData.mobile }
        : ti
    ));
    setEditingTeamIncharge(null);
    resetForm();
  };

  const handleDeleteTeamIncharge = (id: number) => {
    if (window.confirm('Are you sure you want to delete this Team Incharge?')) {
      setTeamIncharges(teamIncharges.filter(ti => ti.id !== id));
    }
  };

  const handleToggleTeamInchargeStatus = (id: number) => {
    setTeamIncharges(teamIncharges.map(ti => 
      ti.id === id 
        ? { ...ti, status: ti.status === 'Active' ? 'Inactive' : 'Active' }
        : ti
    ));
  };

  const handleAddTelecaller = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedIncharge = teamIncharges.find(ti => ti.id === parseInt(formData.assignedInchargeId));
    const newTelecaller = {
      id: telecallers.length + 1,
      name: formData.name,
      mobile: formData.mobile,
      email: formData.email,
      assignedIncharge: assignedIncharge?.name || 'Unassigned',
      assignedInchargeId: parseInt(formData.assignedInchargeId) || 0,
      status: 'Active',
      joiningDate: new Date().toISOString().split('T')[0],
      teamName: assignedIncharge?.teamName || 'Unassigned'
    };
    setTelecallers([...telecallers, newTelecaller]);
    setShowAddTelecallerModal(false);
    resetForm();
  };

  const handleEditTelecaller = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedIncharge = teamIncharges.find(ti => ti.id === parseInt(formData.assignedInchargeId));
    setTelecallers(telecallers.map(tc => 
      tc.id === editingTelecaller.id 
        ? { 
            ...tc, 
            name: formData.name, 
            mobile: formData.mobile, 
            email: formData.email,
            assignedIncharge: assignedIncharge?.name || 'Unassigned',
            assignedInchargeId: parseInt(formData.assignedInchargeId) || 0,
            teamName: assignedIncharge?.teamName || 'Unassigned'
          }
        : tc
    ));
    setEditingTelecaller(null);
    resetForm();
  };

  const handleDeleteTelecaller = (id: number) => {
    if (window.confirm('Are you sure you want to delete this Telecaller?')) {
      setTelecallers(telecallers.filter(tc => tc.id !== id));
    }
  };

  const handleToggleTelecallerStatus = (id: number) => {
    setTelecallers(telecallers.map(tc => 
      tc.id === id 
        ? { ...tc, status: tc.status === 'Active' ? 'Inactive' : 'Active' }
        : tc
    ));
  };

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedIncharge = teamIncharges.find(ti => ti.id === parseInt(formData.teamInchargeId));
    const selectedTelecallerNames = telecallers
      .filter(tc => formData.selectedTelecallers.includes(tc.id))
      .map(tc => tc.name);
    
    const newTeam = {
      id: teams.length + 1,
      name: formData.teamName,
      description: formData.description,
      teamIncharge: assignedIncharge?.name || 'Unassigned',
      teamInchargeId: parseInt(formData.teamInchargeId) || 0,
      telecallers: selectedTelecallerNames,
      telecallerIds: formData.selectedTelecallers,
      status: 'Active',
      createdDate: new Date().toISOString().split('T')[0]
    };
    setTeams([...teams, newTeam]);
    setShowCreateTeamModal(false);
    resetForm();
  };

  const handleEditTeam = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedIncharge = teamIncharges.find(ti => ti.id === parseInt(formData.teamInchargeId));
    const selectedTelecallerNames = telecallers
      .filter(tc => formData.selectedTelecallers.includes(tc.id))
      .map(tc => tc.name);
    
    setTeams(teams.map(team => 
      team.id === editingTeam.id 
        ? { 
            ...team, 
            name: formData.teamName,
            description: formData.description,
            teamIncharge: assignedIncharge?.name || 'Unassigned',
            teamInchargeId: parseInt(formData.teamInchargeId) || 0,
            telecallers: selectedTelecallerNames,
            telecallerIds: formData.selectedTelecallers
          }
        : team
    ));
    setEditingTeam(null);
    resetForm();
  };

  const handleDeleteTeam = (id: number) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      setTeams(teams.filter(team => team.id !== id));
    }
  };

  const openEditTeamInchargeModal = (teamIncharge: any) => {
    setEditingTeamIncharge(teamIncharge);
    setFormData({
      ...formData,
      name: teamIncharge.name,
      email: teamIncharge.email,
      mobile: teamIncharge.mobile
    });
  };

  const openEditTelecallerModal = (telecaller: any) => {
    setEditingTelecaller(telecaller);
    setFormData({
      ...formData,
      name: telecaller.name,
      mobile: telecaller.mobile,
      email: telecaller.email,
      assignedInchargeId: telecaller.assignedInchargeId.toString()
    });
  };

  const openEditTeamModal = (team: any) => {
    setEditingTeam(team);
    setFormData({
      ...formData,
      teamName: team.name,
      description: team.description,
      teamInchargeId: team.teamInchargeId.toString(),
      selectedTelecallers: team.telecallerIds
    });
  };
  // Column Management Functions
  const updateColumnStatus = (columnId: number, isActive: boolean) => {
    setColumns(prev => prev.map(col => 
      col.id === columnId ? { ...col, isActive } : col
    ));
    setCustomColumns(prev => prev.map(col => 
      col.id === columnId ? { ...col, isActive } : col
    ));
  };

  const updateColumnDisplayName = (columnId: number, displayName: string) => {
    setColumns(prev => prev.map(col => 
      col.id === columnId ? { ...col, displayName } : col
    ));
    setCustomColumns(prev => prev.map(col => 
      col.id === columnId ? { ...col, displayName } : col
    ));
  };


  const deleteCustomColumn = (columnId: number) => {
    if (confirm('Are you sure you want to delete this custom column?')) {
      setCustomColumns(prev => prev.filter(col => col.id !== columnId));
    }
  };


  const exportColumnConfig = () => {
    const config = {
      columns,
      customColumns,
      exportDate: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "column_config.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  useEffect(() => {
    if (activeSection === 'employee-management' && user?.tenantId) {
      loadEmployees();
    }
  }, [activeSection, roleFilter, user?.tenantId]);

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const data = await employeeService.getEmployees(user.tenantId, roleFilter);
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
      alert('Failed to load employees');
    } finally {
      setIsLoading(false);
    }
  };

  const resetEmployeeForm = () => {
    setEmployeeFormData({
      name: '',
      mobile: '',
      empId: '',
      password: '',
      role: 'Telecaller',
    });
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await employeeService.createEmployee(user.tenantId, user.id, employeeFormData);
      setShowAddEmployeeModal(false);
      resetEmployeeForm();
      await loadEmployees();
      alert('Employee added successfully!');
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Failed to add employee. Please check if EMP ID is unique.');
    } finally {
      setIsLoading(false);
    }
  };

  const openEditEmployeeModal = (employee: Employee) => {
    setEditingEmployee(employee);
    setEmployeeFormData({
      name: employee.name,
      mobile: employee.mobile,
      empId: employee.empId,
      password: '',
      role: employee.role,
    });
    setShowEditEmployeeModal(true);
  };

  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    try {
      setIsLoading(true);
      await employeeService.updateEmployee(editingEmployee.id, {
        name: employeeFormData.name,
        mobile: employeeFormData.mobile,
        empId: employeeFormData.empId,
        role: employeeFormData.role,
      });
      setShowEditEmployeeModal(false);
      setEditingEmployee(null);
      resetEmployeeForm();
      await loadEmployees();
      alert('Employee updated successfully!');
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Failed to update employee');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId: string, employeeName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${employeeName}?`)) {
      return;
    }

    try {
      setIsLoading(true);
      await employeeService.deleteEmployee(employeeId);
      await loadEmployees();
      alert('Employee deleted successfully!');
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Failed to delete employee');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (employeeId: string, employeeName: string) => {
    if (!window.confirm(`Reset password for ${employeeName}?`)) {
      return;
    }

    try {
      setIsLoading(true);
      const newPassword = await employeeService.resetEmployeePassword(employeeId);
      setTempPassword(newPassword);
      setShowTempPasswordModal(true);
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleEmployeeStatus = async (employee: Employee) => {
    try {
      setIsLoading(true);
      await employeeService.toggleEmployeeStatus(employee.id, employee.status);
      await loadEmployees();
      alert(`Employee ${employee.status === 'active' ? 'blocked' : 'unblocked'} successfully!`);
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to update employee status');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Password copied to clipboard!');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="bg-blue-500 rounded-lg p-3 mr-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Teams</p>
                    <p className="text-2xl font-bold text-gray-900">8</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="bg-green-500 rounded-lg p-3 mr-4">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Recovery</p>
                    <p className="text-2xl font-bold text-gray-900">₹2.8M</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="bg-purple-500 rounded-lg p-3 mr-4">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Cases</p>
                    <p className="text-2xl font-bold text-gray-900">1,847</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="bg-orange-500 rounded-lg p-3 mr-4">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">74.2%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Performance and Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
                <div className="space-y-4">
                  {[
                    { team: 'Recovery Team A', lead: 'John Smith', cases: 245, success: '82%', status: 'excellent' },
                    { team: 'Recovery Team B', lead: 'Sarah Johnson', cases: 198, success: '76%', status: 'good' },
                    { team: 'Recovery Team C', lead: 'Mike Davis', cases: 156, success: '68%', status: 'average' },
                    { team: 'Recovery Team D', lead: 'Lisa Wilson', cases: 132, success: '71%', status: 'good' }
                  ].map((team, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{team.team}</h4>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          team.status === 'excellent' ? 'bg-green-100 text-green-800' :
                          team.status === 'good' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {team.success}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Lead: {team.lead}</p>
                      <p className="text-sm text-gray-600">Cases: {team.cases}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Activity</h3>
                <div className="space-y-4">
                  {[
                    { time: '10:30 AM', activity: 'New case assigned to Team A', type: 'case' },
                    { time: '11:15 AM', activity: 'Payment received - Case #1247', type: 'payment' },
                    { time: '1:45 PM', activity: 'Team B completed 5 follow-ups', type: 'followup' },
                    { time: '3:20 PM', activity: 'Case #0987 marked as resolved', type: 'resolved' },
                    { time: '4:10 PM', activity: 'Team meeting scheduled for tomorrow', type: 'meeting' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'payment' ? 'bg-green-500' :
                        activity.type === 'resolved' ? 'bg-blue-500' :
                        activity.type === 'case' ? 'bg-purple-500' : 'bg-gray-400'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.activity}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'employee-management':
        return (
          <div>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Employee Management</h3>
                  <p className="text-sm text-gray-600 mt-1">Manage all employees with role-based filtering</p>
                </div>
                <button
                  onClick={() => setShowAddEmployeeModal(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Employee
                </button>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex space-x-2">
                <button
                  onClick={() => setRoleFilter('All')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    roleFilter === 'All'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  All Employees
                </button>
                <button
                  onClick={() => setRoleFilter('TeamIncharge')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    roleFilter === 'TeamIncharge'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Team Incharge
                </button>
                <button
                  onClick={() => setRoleFilter('Telecaller')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    roleFilter === 'Telecaller'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Telecaller
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {isLoading ? (
                <div className="flex items-center justify-center p-12">
                  <div className="text-gray-500">Loading employees...</div>
                </div>
              ) : employees.length === 0 ? (
                <div className="flex items-center justify-center p-12">
                  <div className="text-gray-500">No employees found. Add your first employee to get started.</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EMP ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {employees.map((employee) => (
                        <tr key={employee.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.mobile}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{employee.empId}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              employee.role === 'TeamIncharge' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {employee.role === 'TeamIncharge' ? 'Team Incharge' : 'Telecaller'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              employee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {employee.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openEditEmployeeModal(employee)}
                                className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                                disabled={isLoading}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteEmployee(employee.id, employee.name)}
                                className="text-red-600 hover:text-red-900 inline-flex items-center"
                                disabled={isLoading}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </button>
                              <button
                                onClick={() => handleResetPassword(employee.id, employee.name)}
                                className="text-gray-600 hover:text-gray-900 inline-flex items-center"
                                disabled={isLoading}
                              >
                                <Key className="w-4 h-4 mr-1" />
                                Reset
                              </button>
                              <button
                                onClick={() => handleToggleEmployeeStatus(employee)}
                                className={`inline-flex items-center ${
                                  employee.status === 'active'
                                    ? 'text-red-600 hover:text-red-900'
                                    : 'text-green-600 hover:text-green-900'
                                }`}
                                disabled={isLoading}
                              >
                                {employee.status === 'active' ? (
                                  <>
                                    <ShieldOff className="w-4 h-4 mr-1" />
                                    Block
                                  </>
                                ) : (
                                  <>
                                    <Shield className="w-4 h-4 mr-1" />
                                    Unblock
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );

      case 'team-assignment':
        return (
          <div>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Team Assignment</h3>
                  <p className="text-sm text-gray-600 mt-1">Create and manage teams with their assignments</p>
                </div>
                <button 
                  onClick={() => setShowCreateTeamModal(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Team
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {teams.map((team) => (
                <div key={team.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{team.name}</h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      team.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {team.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{team.description}</p>
                  
                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Team Incharge:</p>
                      <p className="text-sm text-gray-600">{team.teamIncharge}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700">Telecallers ({team.telecallers.length}):</p>
                      {team.telecallers.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {team.telecallers.map((telecaller, index) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                              {telecaller}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No telecallers assigned</p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700">Created:</p>
                      <p className="text-sm text-gray-600">{team.createdDate}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditTeamModal(team)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium inline-flex items-center justify-center"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium inline-flex items-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'cases':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Case Management</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600">Case management functionality will be implemented here.</p>
            </div>
          </div>
        );
      
      case 'reports':
        const getReportData = () => {
          switch (activeReportTab) {
            case 'daily':
              return {
                totalCalls: 347,
                totalConnected: 268,
                totalPTPs: 89,
                totalCollections: '₹2.4L',
                topPerformers: [
                  { name: 'Amit Kumar', collections: '₹45,000', successRate: '85%', rank: 1 },
                  { name: 'Priya Sharma', collections: '₹38,000', successRate: '82%', rank: 2 },
                  { name: 'Rohit Singh', collections: '₹32,000', successRate: '78%', rank: 3 }
                ],
                telecallerData: [
                  { name: 'Amit Kumar', calls: 45, connected: 38, ptps: 12, collections: '₹45,000', successRate: 85, team: 'Team A' },
                  { name: 'Priya Sharma', calls: 42, connected: 35, ptps: 11, collections: '₹38,000', successRate: 82, team: 'Team A' },
                  { name: 'Rohit Singh', calls: 38, connected: 30, ptps: 9, collections: '₹32,000', successRate: 78, team: 'Team B' },
                  { name: 'Sunita Patel', calls: 35, connected: 28, ptps: 8, collections: '₹28,000', successRate: 75, team: 'Team B' },
                  { name: 'Vikram Gupta', calls: 40, connected: 32, ptps: 10, collections: '₹35,000', successRate: 80, team: 'Team C' }
                ],
                followUps: {
                  pending: [
                    { customer: 'Rajesh Kumar', amount: '₹25,000', dueDate: 'Today', priority: 'High' },
                    { customer: 'Sunita Sharma', amount: '₹15,000', dueDate: 'Today', priority: 'Medium' }
                  ],
                  overdue: [
                    { customer: 'Vikram Singh', amount: '₹35,000', dueDate: '2 days ago', priority: 'Critical' },
                    { customer: 'Meera Reddy', amount: '₹20,000', dueDate: '1 day ago', priority: 'High' }
                  ],
                  upcoming: [
                    { customer: 'Amit Patel', amount: '₹18,000', dueDate: 'Tomorrow', priority: 'Medium' },
                    { customer: 'Kavita Singh', amount: '₹22,000', dueDate: 'Day after', priority: 'Low' }
                  ]
                }
              };
            case 'weekly':
              return {
                totalCalls: 2156,
                totalConnected: 1687,
                totalPTPs: 542,
                totalCollections: '₹18.7L',
                topPerformers: [
                  { name: 'Amit Kumar', collections: '₹3.2L', successRate: '87%', rank: 1 },
                  { name: 'Priya Sharma', collections: '₹2.8L', successRate: '84%', rank: 2 },
                  { name: 'Rohit Singh', collections: '₹2.5L', successRate: '81%', rank: 3 }
                ],
                telecallerData: [
                  { name: 'Amit Kumar', calls: 315, connected: 275, ptps: 85, collections: '₹3.2L', successRate: 87, team: 'Team A' },
                  { name: 'Priya Sharma', calls: 298, connected: 251, ptps: 78, collections: '₹2.8L', successRate: 84, team: 'Team A' },
                  { name: 'Rohit Singh', calls: 287, connected: 233, ptps: 72, collections: '₹2.5L', successRate: 81, team: 'Team B' },
                  { name: 'Sunita Patel', calls: 265, connected: 198, ptps: 65, collections: '₹2.1L', successRate: 75, team: 'Team B' },
                  { name: 'Vikram Gupta', calls: 278, connected: 225, ptps: 68, collections: '₹2.3L', successRate: 78, team: 'Team C' }
                ],
                followUps: {
                  pending: [
                    { customer: 'Multiple Cases', amount: '₹2.5L', dueDate: 'This Week', priority: 'High' }
                  ],
                  overdue: [
                    { customer: 'Multiple Cases', amount: '₹1.8L', dueDate: 'Last Week', priority: 'Critical' }
                  ],
                  upcoming: [
                    { customer: 'Multiple Cases', amount: '₹3.2L', dueDate: 'Next Week', priority: 'Medium' }
                  ]
                }
              };
            case 'monthly':
              return {
                totalCalls: 8945,
                totalConnected: 7156,
                totalPTPs: 2287,
                totalCollections: '₹78.5L',
                topPerformers: [
                  { name: 'Amit Kumar', collections: '₹12.8L', successRate: '89%', rank: 1 },
                  { name: 'Priya Sharma', collections: '₹11.2L', successRate: '86%', rank: 2 },
                  { name: 'Rohit Singh', collections: '₹10.5L', successRate: '83%', rank: 3 }
                ],
                telecallerData: [
                  { name: 'Amit Kumar', calls: 1245, connected: 1108, ptps: 342, collections: '₹12.8L', successRate: 89, team: 'Team A' },
                  { name: 'Priya Sharma', calls: 1198, connected: 1031, ptps: 318, collections: '₹11.2L', successRate: 86, team: 'Team A' },
                  { name: 'Rohit Singh', calls: 1156, connected: 959, ptps: 295, collections: '₹10.5L', successRate: 83, team: 'Team B' },
                  { name: 'Sunita Patel', calls: 1087, connected: 815, ptps: 267, collections: '₹8.9L', successRate: 75, team: 'Team B' },
                  { name: 'Vikram Gupta', calls: 1134, connected: 923, ptps: 278, collections: '₹9.7L', successRate: 81, team: 'Team C' }
                ],
                followUps: {
                  pending: [
                    { customer: 'Multiple Cases', amount: '₹12.5L', dueDate: 'This Month', priority: 'High' }
                  ],
                  overdue: [
                    { customer: 'Multiple Cases', amount: '₹8.7L', dueDate: 'Last Month', priority: 'Critical' }
                  ],
                  upcoming: [
                    { customer: 'Multiple Cases', amount: '₹15.2L', dueDate: 'Next Month', priority: 'Medium' }
                  ]
                }
              };
            default:
              return {};
          }
        };

        const reportData = getReportData();

        return (
          <div>
            {/* Report Navigation Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📑 Reports Dashboard</h3>
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  {[
                    { id: 'daily', label: 'Daily Report', icon: '📅' },
                    { id: 'weekly', label: 'Weekly Report', icon: '📊' },
                    { id: 'monthly', label: 'Monthly Report', icon: '📈' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveReportTab(tab.id)}
                      className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeReportTab === tab.id
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Team Totals Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="bg-blue-500 rounded-lg p-3 mr-4">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">📞 Total Calls</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.totalCalls}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="bg-green-500 rounded-lg p-3 mr-4">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">✅ Connected</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.totalConnected}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="bg-purple-500 rounded-lg p-3 mr-4">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">🤝 Total PTPs</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.totalPTPs}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="bg-orange-500 rounded-lg p-3 mr-4">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">💰 Collections</p>
                    <p className="text-2xl font-bold text-gray-900">{reportData.totalCollections}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Top 3 Performers */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top Performers</h3>
                <div className="space-y-4">
                  {reportData.topPerformers?.map((performer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">
                          {performer.rank === 1 ? '🥇' : performer.rank === 2 ? '🥈' : '🥉'}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{performer.name}</p>
                          <p className="text-sm text-gray-600">Success Rate: {performer.successRate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{performer.collections}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Charts Placeholder */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Performance Charts</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <h4 className="font-medium text-gray-900">Bar Chart</h4>
                    <p className="text-sm text-gray-600">Calls vs Connected</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-4xl mb-2">🥧</div>
                    <h4 className="font-medium text-gray-900">Pie Chart</h4>
                    <p className="text-sm text-gray-600">PTP vs Collections</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-4xl mb-2">📈</div>
                    <h4 className="font-medium text-gray-900">Line Chart</h4>
                    <p className="text-sm text-gray-600">Performance Trend</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Telecaller-wise Comparison */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">✅ Telecaller-wise Performance Comparison</h3>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emp ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calls Made</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Connected</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Connection %</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PTPs</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PTP Conv %</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collections</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Achievement %</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Follow-ups</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Call Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.telecallerData?.map((telecaller, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {telecaller.rank === 1 && <span className="text-2xl mr-2">🥇</span>}
                              {telecaller.rank === 2 && <span className="text-2xl mr-2">🥈</span>}
                              {telecaller.rank === 3 && <span className="text-2xl mr-2">🥉</span>}
                              <span className="text-sm font-medium text-gray-900">#{telecaller.rank}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{telecaller.empId}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{telecaller.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{telecaller.team}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{telecaller.calls}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{telecaller.connected}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {Math.round((telecaller.connected / telecaller.calls) * 100)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{telecaller.ptps}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{telecaller.ptpConversion}%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{telecaller.collections}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{telecaller.target}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              telecaller.achievement >= 100 ? 'bg-green-100 text-green-800' :
                              telecaller.achievement >= 90 ? 'bg-blue-100 text-blue-800' :
                              telecaller.achievement >= 80 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {telecaller.achievement}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{telecaller.followUps}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{telecaller.avgCallDuration}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              telecaller.successRate >= 85 ? 'bg-green-100 text-green-800' :
                              telecaller.successRate >= 75 ? 'bg-blue-100 text-blue-800' :
                              telecaller.successRate >= 65 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {telecaller.successRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Follow-up Reports */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📆 Pending Follow-ups</h3>
                <div className="space-y-3">
                  {reportData.followUps?.pending.map((item, index) => (
                    <div key={index} className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                      <p className="font-medium text-gray-900">{item.customer}</p>
                      <p className="text-sm text-gray-600">Amount: {item.amount}</p>
                      <p className="text-sm text-gray-600">Due: {item.dueDate}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                        item.priority === 'High' ? 'bg-red-100 text-red-800' :
                        item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">⚠️ Overdue Follow-ups</h3>
                <div className="space-y-3">
                  {reportData.followUps?.overdue.map((item, index) => (
                    <div key={index} className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                      <p className="font-medium text-gray-900">{item.customer}</p>
                      <p className="text-sm text-gray-600">Amount: {item.amount}</p>
                      <p className="text-sm text-gray-600">Overdue: {item.dueDate}</p>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 bg-red-100 text-red-800">
                        {item.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Upcoming Follow-ups</h3>
                <div className="space-y-3">
                  {reportData.followUps?.upcoming.map((item, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <p className="font-medium text-gray-900">{item.customer}</p>
                      <p className="text-sm text-gray-600">Amount: {item.amount}</p>
                      <p className="text-sm text-gray-600">Due: {item.dueDate}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                        item.priority === 'High' ? 'bg-red-100 text-red-800' :
                        item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📤 Export Options</h3>
              <div className="flex space-x-4">
                <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium inline-flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Export PDF
                </button>
                <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium inline-flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Export Excel
                </button>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium inline-flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Columns className="w-6 h-6 mr-3 text-blue-600" />
                    Custom Column Management
                  </h3>
                  <p className="text-gray-600 mt-1">Configure which columns to display on the Telecaller page</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </button>
                  <button
                    onClick={saveColumnConfiguration}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Configuration
                  </button>
                </div>
              </div>
            </div>

            {/* Default Columns Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  Default Columns
                </h4>
                <p className="text-gray-600 mt-1">Enable/disable and rename default system columns</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {columns.map((column, index) => (
                    <div key={column.columnName} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={column.isActive}
                            onChange={(e) => toggleColumn(index, e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={column.displayName}
                            onChange={(e) => updateColumnName(index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <p className="text-xs text-gray-500 mt-1">{column.columnName}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          column.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {column.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Columns Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-purple-600" />
                  Custom Columns
                </h4>
                <p className="text-gray-600 mt-1">Add your own custom columns for additional data</p>
              </div>
              <div className="p-6">
                {/* Add Custom Column Form */}
                <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Column Name</label>
                      <input
                        type="text"
                        value={newCustomColumn.columnName}
                        onChange={(e) => setNewCustomColumn({...newCustomColumn, columnName: e.target.value})}
                        placeholder="e.g., branchCode"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                      <input
                        type="text"
                        value={newCustomColumn.displayName}
                        onChange={(e) => setNewCustomColumn({...newCustomColumn, displayName: e.target.value})}
                        placeholder="e.g., Branch Code"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={addCustomColumn}
                        disabled={!newCustomColumn.columnName || !newCustomColumn.displayName}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        Add Column
                      </button>
                    </div>
                  </div>
                </div>

                {/* Custom Columns List */}
                {customColumns.length > 0 ? (
                  <div className="space-y-3">
                    {customColumns.map((column, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={column.isActive}
                            onChange={(e) => toggleCustomColumn(index, e.target.checked)}
                            className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <div>
                            <p className="font-medium text-gray-900">{column.displayName}</p>
                            <p className="text-sm text-gray-500">{column.columnName}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            column.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {column.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            onClick={() => removeCustomColumn(index)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Columns className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No custom columns added yet</p>
                    <p className="text-sm">Add custom columns using the form above</p>
                  </div>
                )}
              </div>
            </div>

            {/* Live Preview */}
            {showPreview && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-blue-600" />
                    Live Preview - Telecaller Table
                  </h4>
                  <p className="text-gray-600 mt-1">This is how the table will appear to telecallers</p>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {getActiveColumns().map((column, index) => (
                            <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {column.displayName}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          {getActiveColumns().map((column, index) => (
                            <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {column.columnName === 'actions' ? (
                                <div className="flex space-x-2">
                                  <button className="text-blue-600 hover:text-blue-900 text-xs">Call</button>
                                  <button className="text-green-600 hover:text-green-900 text-xs">Update</button>
                                  <button className="text-purple-600 hover:text-purple-900 text-xs">View</button>
                                </div>
                              ) : (
                                'Sample Data'
                              )}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Configuration Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Configuration Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{getActiveColumns().length}</div>
                    <div className="text-sm text-gray-600">Active Columns</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{columns.filter(c => c.isActive).length}</div>
                    <div className="text-sm text-gray-600">Default Columns</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{customColumns.filter(c => c.isActive).length}</div>
                    <div className="text-sm text-gray-600">Custom Columns</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Layout
        user={user}
        onLogout={onLogout}
        menuItems={menuItems}
        title="Shakti - Company Admin"
        roleColor="bg-blue-500"
      >
        {renderContent()}
      </Layout>

      {showAddEmployeeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Employee</h3>
              <button
                onClick={() => {
                  setShowAddEmployeeModal(false);
                  resetEmployeeForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={employeeFormData.name}
                  onChange={(e) => setEmployeeFormData({...employeeFormData, name: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={employeeFormData.mobile}
                  onChange={(e) => setEmployeeFormData({...employeeFormData, mobile: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  EMP ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={employeeFormData.empId}
                  onChange={(e) => setEmployeeFormData({...employeeFormData, empId: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={employeeFormData.password}
                    onChange={(e) => setEmployeeFormData({...employeeFormData, password: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={employeeFormData.role}
                  onChange={(e) => setEmployeeFormData({...employeeFormData, role: e.target.value as EmployeeRole})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Telecaller">Telecaller</option>
                  <option value="TeamIncharge">Team Incharge</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddEmployeeModal(false);
                    resetEmployeeForm();
                  }}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md text-sm font-medium"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditEmployeeModal && editingEmployee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Employee</h3>
              <button
                onClick={() => {
                  setShowEditEmployeeModal(false);
                  setEditingEmployee(null);
                  resetEmployeeForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditEmployee} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={employeeFormData.name}
                  onChange={(e) => setEmployeeFormData({...employeeFormData, name: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={employeeFormData.mobile}
                  onChange={(e) => setEmployeeFormData({...employeeFormData, mobile: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  EMP ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={employeeFormData.empId}
                  onChange={(e) => setEmployeeFormData({...employeeFormData, empId: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={employeeFormData.role}
                  onChange={(e) => setEmployeeFormData({...employeeFormData, role: e.target.value as EmployeeRole})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Telecaller">Telecaller</option>
                  <option value="TeamIncharge">Team Incharge</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditEmployeeModal(false);
                    setEditingEmployee(null);
                    resetEmployeeForm();
                  }}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md text-sm font-medium"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTempPasswordModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Password Reset Successful</h3>
              <button
                onClick={() => {
                  setShowTempPasswordModal(false);
                  setTempPassword('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                The password has been reset. Please share this temporary password with the employee:
              </p>

              <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="flex items-center justify-between">
                  <code className="text-lg font-mono font-bold text-gray-900">{tempPassword}</code>
                  <button
                    onClick={() => copyToClipboard(tempPassword)}
                    className="ml-4 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Please ensure the employee changes this password after their first login.
              </p>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => {
                    setShowTempPasswordModal(false);
                    setTempPassword('');
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CompanyAdminDashboard;