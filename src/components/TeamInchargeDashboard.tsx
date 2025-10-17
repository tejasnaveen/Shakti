import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import { columnConfigService } from '../services/columnConfigService';
import { customerCaseService } from '../services/customerCaseService';
import { employeeService } from '../services/employeeService';
import { excelUtils } from '../utils/excelUtils';
import { 
  Home, 
  Users, 
  FileText, 
  BarChart3, 
  Settings,
  Phone,
  Clock,
  Target,
  CheckCircle,
  Eye,
  X,
  Download,
  Calendar,
  TrendingUp,
  Award,
  AlertTriangle
} from 'lucide-react';

interface TeamInchargeDashboardProps {
  user: any;
  onLogout: () => void;
}

const TeamInchargeDashboard: React.FC<TeamInchargeDashboardProps> = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [activeReportType, setActiveReportType] = useState('daily');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showMemberDetailsModal, setShowMemberDetailsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [newMember, setNewMember] = useState({
    empId: '',
    username: '',
    password: '',
    designation: '',
    department: '',
    product: ''
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [columnConfigs, setColumnConfigs] = useState<any[]>([]);

  const teamMembers = [
    {
      empId: 'EMP001',
      name: 'Amit Kumar',
      email: 'amit.kumar@company.com',
      phone: '+91 98765 43210',
      designation: 'Senior Telecaller',
      department: 'Recovery Team A',
      joiningDate: '2023-06-15',
      reportingManager: 'John Smith',
      address: '123, MG Road, Bangalore, Karnataka - 560001',
      emergencyContactName: 'Priya Kumar',
      emergencyContact: '+91 98765 43211',
      bankAccount: '****7890',
      ifscCode: 'HDFC0001234',
      panNumber: 'ABCDE1234F',
      aadharNumber: '****9012',
      cases: 45,
      rate: '82%',
      status: 'Active'
    },
    {
      empId: 'EMP002',
      name: 'Priya Patel',
      email: 'priya.patel@company.com',
      phone: '+91 98765 43220',
      designation: 'Telecaller',
      department: 'Recovery Team A',
      joiningDate: '2023-08-20',
      reportingManager: 'John Smith',
      address: '456, Park Street, Mumbai, Maharashtra - 400001',
      emergencyContactName: 'Raj Patel',
      emergencyContact: '+91 98765 43221',
      bankAccount: '****5678',
      ifscCode: 'ICICI0001234',
      panNumber: 'FGHIJ5678K',
      aadharNumber: '****3456',
      cases: 38,
      rate: '78%',
      status: 'Active'
    },
    {
      empId: 'EMP003',
      name: 'Rahul Kumar',
      email: 'rahul.kumar@company.com',
      phone: '+91 98765 43230',
      designation: 'Junior Telecaller',
      department: 'Recovery Team A',
      joiningDate: '2023-10-10',
      reportingManager: 'John Smith',
      address: '789, Civil Lines, Delhi - 110001',
      emergencyContactName: 'Sunita Kumar',
      emergencyContact: '+91 98765 43231',
      bankAccount: '****1234',
      ifscCode: 'SBI0001234',
      panNumber: 'KLMNO1234P',
      aadharNumber: '****7890',
      cases: 32,
      rate: '71%',
      status: 'Active'
    },
    {
      empId: 'EMP004',
      name: 'Neha Singh',
      email: 'neha.singh@company.com',
      phone: '+91 98765 43240',
      designation: 'Telecaller',
      department: 'Recovery Team A',
      joiningDate: '2023-07-05',
      reportingManager: 'John Smith',
      address: '321, Anna Nagar, Chennai, Tamil Nadu - 600040',
      emergencyContactName: 'Vikram Singh',
      emergencyContact: '+91 98765 43241',
      bankAccount: '****9876',
      ifscCode: 'AXIS0001234',
      panNumber: 'PQRST9876U',
      aadharNumber: '****2468',
      cases: 41,
      rate: '85%',
      status: 'Active'
    }
  ];

  const designationOptions = [
    'Senior Telecaller',
    'Telecaller',
    'Junior Telecaller',
    'Team Lead',
    'Assistant Manager'
  ];

  const departmentOptions = [
    'Recovery Team A',
    'Recovery Team B',
    'Recovery Team C',
    'Recovery Team D'
  ];

  const productOptions = [
    'Personal Loan',
    'Home Loan',
    'Car Loan',
    'Business Loan',
    'Credit Card'
  ];

  useEffect(() => {
    if (user?.tenantId) {
      loadColumnConfigurations();
    }
  }, [user?.tenantId]);

  const loadColumnConfigurations = async () => {
    try {
      const configs = await columnConfigService.getActiveColumnConfigurations(user.tenantId);
      setColumnConfigs(configs);
    } catch (error) {
      console.error('Error loading column configurations:', error);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      if (columnConfigs.length === 0) {
        alert('Loading column configurations. Please try again in a moment.');
        await loadColumnConfigurations();
        return;
      }

      excelUtils.generateTemplate(columnConfigs);
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Failed to download template');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        alert('Please select a valid Excel file (.xlsx or .xls)');
        return;
      }
      setUploadFile(file);
      setUploadStatus('');
    }
  };

  const handleUploadCases = async () => {
    if (!uploadFile) {
      alert('Please select a file first');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(10);
      setUploadStatus('Parsing Excel file...');

      const rows = await excelUtils.parseExcelFile(uploadFile, columnConfigs);

      setUploadProgress(30);
      setUploadStatus('Validating data...');

      const validRows: any[] = [];
      const errors: string[] = [];

      rows.forEach((row, index) => {
        const validation = excelUtils.validateCaseData(row, columnConfigs);
        if (validation.valid) {
          validRows.push(row);
        } else {
          errors.push(`Row ${index + 2}: ${validation.errors.join(', ')}`);
        }
      });

      if (validRows.length === 0) {
        alert('No valid rows found in the Excel file.\n\nErrors:\n' + errors.slice(0, 10).join('\n'));
        setIsUploading(false);
        return;
      }

      setUploadProgress(50);
      setUploadStatus(`Processing ${validRows.length} valid cases...`);

      const employees = await employeeService.getEmployees(user.tenantId, 'All');

      setUploadProgress(60);
      const casesToInsert = validRows.map(row => ({
        tenant_id: user.tenantId,
        assigned_employee_id: row.EMPID,
        loan_id: row.loanId || '',
        customer_name: row.customerName || '',
        mobile_no: row.mobileNo || '',
        loan_amount: row.loanAmount || '',
        loan_type: row.loanType || '',
        outstanding_amount: row.outstandingAmount || '',
        pos_amount: row.posAmount || '',
        emi_amount: row.emiAmount || '',
        pending_dues: row.pendingDues || '',
        dpd: row.dpd ? parseInt(row.dpd) : 0,
        branch_name: row.branchName || '',
        address: row.address || '',
        sanction_date: row.sanctionDate || null,
        last_paid_date: row.lastPaidDate || null,
        last_paid_amount: row.lastPaidAmount || '',
        payment_link: row.paymentLink || '',
        remarks: row.remarks || '',
        case_status: 'pending',
        uploaded_by: user.id
      }));

      setUploadProgress(80);
      setUploadStatus('Uploading cases to database...');

      await customerCaseService.bulkCreateCases(casesToInsert);

      setUploadProgress(100);
      setUploadStatus(`Successfully uploaded ${validRows.length} cases!`);

      const employeeCounts: Record<string, number> = {};
      validRows.forEach(row => {
        employeeCounts[row.EMPID] = (employeeCounts[row.EMPID] || 0) + 1;
      });

      const summary = Object.entries(employeeCounts)
        .map(([empId, count]) => `${empId}: ${count} cases`)
        .join('\n');

      alert(`Upload successful!\n\nCases uploaded by employee:\n${summary}\n\n${errors.length > 0 ? `\nErrors found in ${errors.length} rows (skipped)` : ''}`);

      setUploadFile(null);
      setUploadProgress(0);

      const fileInput = document.getElementById('excel-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error uploading cases:', error);
      alert('Failed to upload cases: ' + (error as Error).message);
    } finally {
      setIsUploading(false);
      setUploadStatus('');
    }
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adding new member:', newMember);
    setShowAddMemberModal(false);
    setNewMember({
      empId: '',
      username: '',
      password: '',
      designation: '',
      department: '',
      product: ''
    });
  };

  const openMemberDetails = (member: any) => {
    setSelectedMember(member);
    setShowMemberDetailsModal(true);
  };

  const closeMemberDetails = () => {
    setShowMemberDetailsModal(false);
    setSelectedMember(null);
  };

  const menuItems = [
    { name: 'Dashboard', icon: Home, active: activeSection === 'dashboard', onClick: () => setActiveSection('dashboard') },
    { name: 'Team Members', icon: Users, active: activeSection === 'members', onClick: () => setActiveSection('members') },
    { name: 'Assign Cases', icon: FileText, active: activeSection === 'assign', onClick: () => setActiveSection('assign') },
    { name: 'Performance', icon: BarChart3, active: activeSection === 'performance', onClick: () => setActiveSection('performance') },
    { name: 'Reports', icon: FileText, active: activeSection === 'reports', onClick: () => setActiveSection('reports') },
    { name: 'Settings', icon: Settings, active: activeSection === 'settings', onClick: () => setActiveSection('settings') },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="bg-green-500 rounded-lg p-3 mr-4">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Team Members</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="bg-blue-500 rounded-lg p-3 mr-4">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Cases</p>
                    <p className="text-2xl font-bold text-gray-900">324</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="bg-purple-500 rounded-lg p-3 mr-4">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Calls Today</p>
                    <p className="text-2xl font-bold text-gray-900">147</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="bg-orange-500 rounded-lg p-3 mr-4">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Recovery Rate</p>
                    <p className="text-2xl font-bold text-gray-900">76.8%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Performance and Case Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance Today</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Amit Sharma', calls: 28, connected: 21, success: 8, rate: '38%' },
                    { name: 'Priya Patel', calls: 32, connected: 26, success: 12, rate: '46%' },
                    { name: 'Rahul Kumar', calls: 25, connected: 19, success: 7, rate: '37%' },
                    { name: 'Neha Singh', calls: 29, connected: 23, success: 11, rate: '48%' }
                  ].map((member, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{member.name}</h4>
                        <span className="text-sm font-semibold text-green-600">{member.rate}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium">Calls: {member.calls}</p>
                        </div>
                        <div>
                          <p className="font-medium">Connected: {member.connected}</p>
                        </div>
                        <div>
                          <p className="font-medium">Success: {member.success}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Status Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-blue-500 mr-3" />
                      <span className="font-medium text-gray-900">Pending Cases</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">89</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-yellow-500 mr-3" />
                      <span className="font-medium text-gray-900">In Progress</span>
                    </div>
                    <span className="text-xl font-bold text-yellow-600">156</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="font-medium text-gray-900">Resolved Today</span>
                    </div>
                    <span className="text-xl font-bold text-green-600">23</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      <Target className="w-5 h-5 text-red-500 mr-3" />
                      <span className="font-medium text-gray-900">High Priority</span>
                    </div>
                    <span className="text-xl font-bold text-red-600">12</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'members':
        return (
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                    <p className="text-sm text-gray-600 mt-1">Manage your team members and their information</p>
                  </div>
                  <button
                    onClick={() => setShowAddMemberModal(true)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Add New Member
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cases Assigned</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Success Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {teamMembers.map((member, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-green-500 rounded-full p-2 mr-3">
                                <Users className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                <div className="text-sm text-gray-500">{member.empId}</div>
                                <div className="text-sm text-gray-500">{member.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.designation}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.department}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.cases}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.rate}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              {member.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openMemberDetails(member)}
                                className="text-green-600 hover:text-green-900 inline-flex items-center"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </button>
                              <button className="text-blue-600 hover:text-blue-900 inline-flex items-center">
                                Edit
                              </button>
                              <button className="text-red-600 hover:text-red-900 inline-flex items-center">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'assign':
        return (
          <div className="space-y-6">
            {/* Bulk Upload Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Bulk Upload Cases</h3>
                <p className="text-sm text-gray-600 mt-1">Upload cases in bulk using Excel sheet</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Upload Excel Sheet</h4>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center">
                        <FileText className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                        {uploadFile ? (
                          <div>
                            <p className="text-sm font-medium text-gray-900 mb-2">{uploadFile.name}</p>
                            <p className="text-xs text-gray-600">File selected successfully</p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600 mb-4">Select Excel file to upload cases</p>
                        )}
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          className="hidden"
                          id="excel-upload"
                          onChange={handleFileSelect}
                          disabled={isUploading}
                        />
                        <label
                          htmlFor="excel-upload"
                          className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer inline-flex items-center ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          {uploadFile ? 'Change File' : 'Select File'}
                        </label>
                      </div>
                      {uploadProgress > 0 && (
                        <div className="space-y-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-600 text-center">{uploadStatus}</p>
                        </div>
                      )}
                      <button
                        onClick={handleUploadCases}
                        disabled={!uploadFile || isUploading}
                        className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {isUploading ? 'Uploading...' : 'Upload & Process'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Download Sample Template</h4>
                    <p className="text-sm text-gray-600 mb-4">Download the sample Excel template with proper column structure based on active columns configured by Company Admin</p>
                    <button
                      onClick={handleDownloadTemplate}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium inline-flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Sample Excel
                    </button>
                    <div className="mt-4 text-xs text-gray-500">
                      <p className="font-medium mb-2">Template includes:</p>
                      <p>EMPID column (required) + all active columns configured by your Company Admin</p>
                      <p className="mt-2 text-blue-600">Active columns: {columnConfigs.length > 0 ? columnConfigs.length : 'Loading...'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reassign Cases Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Reassign Cases</h3>
                <p className="text-sm text-gray-600 mt-1">Reassign cases to telecallers based on filters</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Telecaller</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="">Select Telecaller</option>
                        <option value="amit">Amit Kumar</option>
                        <option value="priya">Priya Patel</option>
                        <option value="rahul">Rahul Kumar</option>
                        <option value="neha">Neha Singh</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Product</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="">All Products</option>
                        <option value="personal">Personal Loan</option>
                        <option value="home">Home Loan</option>
                        <option value="car">Car Loan</option>
                        <option value="business">Business Loan</option>
                        <option value="credit">Credit Card</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Filter by DPD</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                        <option value="">All DPD</option>
                        <option value="0-30">0-30 days</option>
                        <option value="31-60">31-60 days</option>
                        <option value="61-90">61-90 days</option>
                        <option value="90+">90+ days</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Outstanding Amount Range</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          placeholder="Min Amount"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <input
                          type="number"
                          placeholder="Max Amount"
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                    
                    <button className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
                      Apply Filters & Reassign
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-4">Filter Results</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Cases Found:</span>
                        <span className="font-medium">156</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Personal Loan:</span>
                        <span className="font-medium">89</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Home Loan:</span>
                        <span className="font-medium">45</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Car Loan:</span>
                        <span className="font-medium">22</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span>DPD 0-30:</span>
                        <span className="font-medium">67</span>
                      </div>
                      <div className="flex justify-between">
                        <span>DPD 31-60:</span>
                        <span className="font-medium">54</span>
                      </div>
                      <div className="flex justify-between">
                        <span>DPD 61+:</span>
                        <span className="font-medium">35</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Remove Cases Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Remove Assigned Cases</h3>
                <p className="text-sm text-gray-600 mt-1">Remove cases from telecaller assignments</p>
              </div>
              <div className="p-6">
                <div className="mb-4 flex items-center space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Telecaller</label>
                    <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500">
                      <option value="">Select Telecaller</option>
                      <option value="amit">Amit Kumar (45 cases)</option>
                      <option value="priya">Priya Patel (38 cases)</option>
                      <option value="rahul">Rahul Kumar (32 cases)</option>
                      <option value="neha">Neha Singh (41 cases)</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium">
                      Remove Selected Cases
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <input type="checkbox" className="rounded border-gray-300" />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DPD</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[
                        { loanId: 'LN001234567', customer: 'Rajesh Kumar', product: 'Personal Loan', outstanding: '₹4,50,000', dpd: 45 },
                        { loanId: 'LN002345678', customer: 'Sunita Sharma', product: 'Home Loan', outstanding: '₹1,95,000', dpd: 30 },
                        { loanId: 'LN003456789', customer: 'Vikram Singh', product: 'Car Loan', outstanding: '₹4,25,000', dpd: 60 }
                      ].map((case_, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input type="checkbox" className="rounded border-gray-300" />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{case_.loanId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{case_.customer}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{case_.product}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">{case_.outstanding}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              case_.dpd <= 30 ? 'bg-green-100 text-green-800' :
                              case_.dpd <= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {case_.dpd} days
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Case Overview Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Case Overview</h3>
                <p className="text-sm text-gray-600 mt-1">View case distribution across telecallers</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Cases by Telecaller</h4>
                    <div className="space-y-3">
                      {[
                        { name: 'Amit Kumar', total: 45, personal: 25, home: 12, car: 8 },
                        { name: 'Priya Patel', total: 38, personal: 20, home: 10, car: 8 },
                        { name: 'Rahul Kumar', total: 32, personal: 18, home: 8, car: 6 },
                        { name: 'Neha Singh', total: 41, personal: 22, home: 11, car: 8 }
                      ].map((telecaller, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900">{telecaller.name}</h5>
                            <span className="text-lg font-bold text-green-600">{telecaller.total}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                            <div>Personal: {telecaller.personal}</div>
                            <div>Home: {telecaller.home}</div>
                            <div>Car: {telecaller.car}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Product Distribution</h4>
                    <div className="space-y-3">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">Personal Loan</span>
                          <span className="text-lg font-bold text-blue-600">85 cases</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">54% of total cases</div>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">Home Loan</span>
                          <span className="text-lg font-bold text-green-600">41 cases</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">26% of total cases</div>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">Car Loan</span>
                          <span className="text-lg font-bold text-purple-600">30 cases</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">19% of total cases</div>
                      </div>
                      
                      <div className="bg-orange-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">Total Cases</span>
                          <span className="text-lg font-bold text-orange-600">156 cases</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Across all products</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'reports':
        return (
          <div className="space-y-6">
            {/* Report Type Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📑 Reports Menu</h3>
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  {[
                    { id: 'daily', label: 'Daily Report', icon: Calendar },
                    { id: 'weekly', label: 'Weekly Report', icon: Calendar },
                    { id: 'monthly', label: 'Monthly Report', icon: Calendar }
                  ].map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveReportType(tab.id)}
                        className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeReportType === tab.id
                            ? 'bg-green-500 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                        }`}
                      >
                        <IconComponent className="w-4 h-4 mr-2" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900">Export Options</h4>
                <div className="flex space-x-3">
                  <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </button>
                  <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Export Excel
                  </button>
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </button>
                </div>
              </div>
            </div>

            {/* Performance Reports */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Performance Reports - {activeReportType.charAt(0).toUpperCase() + activeReportType.slice(1)}</h3>
              </div>
              <div className="p-6">
                {/* Team Totals */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Phone className="w-8 h-8 text-blue-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Calls</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {activeReportType === 'daily' ? '347' : activeReportType === 'weekly' ? '2,431' : '10,247'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Connected</p>
                        <p className="text-2xl font-bold text-green-600">
                          {activeReportType === 'daily' ? '268' : activeReportType === 'weekly' ? '1,945' : '8,197'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <Target className="w-8 h-8 text-purple-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total PTPs</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {activeReportType === 'daily' ? '89' : activeReportType === 'weekly' ? '623' : '2,654'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <TrendingUp className="w-8 h-8 text-orange-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Collections</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {activeReportType === 'daily' ? '₹2.4L' : activeReportType === 'weekly' ? '₹16.8L' : '₹72.5L'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Leaderboard */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top 3 Performers</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { name: 'Neha Singh', collections: activeReportType === 'daily' ? '₹65K' : activeReportType === 'weekly' ? '₹4.2L' : '₹18.5L', calls: activeReportType === 'daily' ? 89 : activeReportType === 'weekly' ? 623 : 2654, rate: '85%', rank: 1, medal: '🥇' },
                      { name: 'Amit Kumar', collections: activeReportType === 'daily' ? '₹58K' : activeReportType === 'weekly' ? '₹3.8L' : '₹16.2L', calls: activeReportType === 'daily' ? 82 : activeReportType === 'weekly' ? 574 : 2441, rate: '82%', rank: 2, medal: '🥈' },
                      { name: 'Priya Patel', collections: activeReportType === 'daily' ? '₹52K' : activeReportType === 'weekly' ? '₹3.4L' : '₹14.8L', calls: activeReportType === 'daily' ? 78 : activeReportType === 'weekly' ? 546 : 2327, rate: '78%', rank: 3, medal: '🥉' }
                    ].map((performer, index) => (
                      <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-6 border-2 border-yellow-200">
                        <div className="text-center">
                          <div className="text-4xl mb-2">{performer.medal}</div>
                          <h5 className="font-bold text-gray-900 text-lg">{performer.name}</h5>
                          <p className="text-sm text-gray-600 mb-3">Rank #{performer.rank}</p>
                          <div className="space-y-2">
                            <div className="bg-white rounded-lg p-2">
                              <p className="text-sm text-gray-600">Collections</p>
                              <p className="font-bold text-green-600">{performer.collections}</p>
                            </div>
                            <div className="bg-white rounded-lg p-2">
                              <p className="text-sm text-gray-600">Success Rate</p>
                              <p className="font-bold text-blue-600">{performer.rate}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Telecaller-wise Comparison Table */}
                <div className="overflow-x-auto">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Telecaller-wise Performance Comparison</h4>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emp ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
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
                      {[
                        { name: 'Neha Singh', calls: activeReportType === 'daily' ? 89 : activeReportType === 'weekly' ? 623 : 2654, connected: activeReportType === 'daily' ? 76 : activeReportType === 'weekly' ? 529 : 2256, connectionRate: '85%', ptps: activeReportType === 'daily' ? 28 : activeReportType === 'weekly' ? 196 : 835, collections: activeReportType === 'daily' ? '₹65K' : activeReportType === 'weekly' ? '₹4.2L' : '₹18.5L', successRate: '85%', rank: 1 },
                        { name: 'Amit Kumar', calls: activeReportType === 'daily' ? 82 : activeReportType === 'weekly' ? 574 : 2441, connected: activeReportType === 'daily' ? 67 : activeReportType === 'weekly' ? 471 : 2002, connectionRate: '82%', ptps: activeReportType === 'daily' ? 24 : activeReportType === 'weekly' ? 168 : 715, collections: activeReportType === 'daily' ? '₹58K' : activeReportType === 'weekly' ? '₹3.8L' : '₹16.2L', successRate: '82%', rank: 2 },
                        { name: 'Priya Patel', calls: activeReportType === 'daily' ? 78 : activeReportType === 'weekly' ? 546 : 2327, connected: activeReportType === 'daily' ? 61 : activeReportType === 'weekly' ? 426 : 1815, connectionRate: '78%', ptps: activeReportType === 'daily' ? 22 : activeReportType === 'weekly' ? 154 : 656, collections: activeReportType === 'daily' ? '₹52K' : activeReportType === 'weekly' ? '₹3.4L' : '₹14.8L', successRate: '78%', rank: 3 },
                        { name: 'Rahul Kumar', calls: activeReportType === 'daily' ? 74 : activeReportType === 'weekly' ? 518 : 2205, connected: activeReportType === 'daily' ? 53 : activeReportType === 'weekly' ? 371 : 1579, connectionRate: '71%', ptps: activeReportType === 'daily' ? 18 : activeReportType === 'weekly' ? 126 : 537, collections: activeReportType === 'daily' ? '₹45K' : activeReportType === 'weekly' ? '₹2.9L' : '₹12.4L', successRate: '71%', rank: 4 }
                      ].map((member, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                              {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                              {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                              <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">EMP{String(index + 1).padStart(3, '0')}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {member.rank <= 3 && (
                                <Award className={`w-4 h-4 mr-2 ${
                                  member.rank === 1 ? 'text-yellow-500' :
                                  member.rank === 2 ? 'text-gray-400' : 'text-orange-600'
                                }`} />
                              )}
                              <div className="text-sm font-medium text-gray-900">{member.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.calls}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.connected}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {Math.round((member.connected / member.calls) * 100)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.ptps}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{Math.round((member.ptps / member.connected) * 100)}%</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{member.collections}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{Math.round(parseInt(member.collections.replace(/[₹,KL]/g, '')) * 1.2)}K</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              member.successRate >= '85%' ? 'bg-green-100 text-green-800' :
                              member.successRate >= '75%' ? 'bg-blue-100 text-blue-800' :
                              member.successRate >= '65%' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {Math.round((parseInt(member.collections.replace(/[₹,KL]/g, '')) / (parseInt(member.collections.replace(/[₹,KL]/g, '')) * 1.2)) * 100)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{Math.floor(member.calls * 0.3)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Math.floor(Math.random() * 5 + 3)}:{String(Math.floor(Math.random() * 60)).padStart(2, '0')}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              member.successRate >= '85%' ? 'bg-green-100 text-green-800' :
                              member.successRate >= '75%' ? 'bg-blue-100 text-blue-800' :
                              member.successRate >= '65%' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {member.successRate}
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Follow-up Reports</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-500">
                    <div className="flex items-center">
                      <Clock className="w-8 h-8 text-yellow-500 mr-4" />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Pending Follow-ups</h4>
                        <p className="text-3xl font-bold text-yellow-600 mt-2">
                          {activeReportType === 'daily' ? '45' : activeReportType === 'weekly' ? '312' : '1,247'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Cases awaiting follow-up</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 rounded-lg p-6 border-l-4 border-red-500">
                    <div className="flex items-center">
                      <AlertTriangle className="w-8 h-8 text-red-500 mr-4" />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Overdue Follow-ups</h4>
                        <p className="text-3xl font-bold text-red-600 mt-2">
                          {activeReportType === 'daily' ? '12' : activeReportType === 'weekly' ? '89' : '356'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Past due date</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
                    <div className="flex items-center">
                      <Calendar className="w-8 h-8 text-blue-500 mr-4" />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Upcoming Follow-ups</h4>
                        <p className="text-3xl font-bold text-blue-600 mt-2">
                          {activeReportType === 'daily' ? '28' : activeReportType === 'weekly' ? '196' : '823'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Scheduled for next 3 days</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Charts Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Visual Analytics</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Bar Chart Placeholder */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">📊 Calls Made vs Connected</h4>
                    <div className="h-64 bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Bar Chart: Calls Made vs Connected</p>
                        <p className="text-sm text-gray-400 mt-2">Chart.js integration placeholder</p>
                      </div>
                    </div>
                  </div>

                  {/* Pie Chart Placeholder */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">🥧 PTP vs Collections</h4>
                    <div className="h-64 bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <div className="text-center">
                        <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Pie Chart: PTP vs Collections</p>
                        <p className="text-sm text-gray-400 mt-2">Chart.js integration placeholder</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Line Chart Placeholder */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">📈 Performance Trend ({activeReportType === 'daily' ? '7 days' : activeReportType === 'weekly' ? '4 weeks' : '12 months'})</h4>
                  <div className="h-64 bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Line Chart: Performance Trend</p>
                      <p className="text-sm text-gray-400 mt-2">Chart.js integration placeholder</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h3>
            <p className="text-gray-600">This section is under development.</p>
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
        title="Shakti - Team In-charge"
        roleColor="bg-green-500"
      >
        {renderContent()}
      </Layout>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Add New Member</h3>
                <button
                  onClick={() => setShowAddMemberModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  EMP ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newMember.empId}
                  onChange={(e) => setNewMember({...newMember, empId: e.target.value})}
                  placeholder="Enter Employee ID"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newMember.username}
                  onChange={(e) => setNewMember({...newMember, username: e.target.value})}
                  placeholder="Enter Username"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newMember.password}
                  onChange={(e) => setNewMember({...newMember, password: e.target.value})}
                  placeholder="Enter Password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation <span className="text-red-500">*</span>
                </label>
                <select
                  value={newMember.designation}
                  onChange={(e) => setNewMember({...newMember, designation: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Designation</option>
                  {designationOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={newMember.department}
                  onChange={(e) => setNewMember({...newMember, department: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Department</option>
                  {departmentOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product <span className="text-red-500">*</span>
                </label>
                <select
                  value={newMember.product}
                  onChange={(e) => setNewMember({...newMember, product: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select Product</option>
                  {productOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Details Modal */}
      {showMemberDetailsModal && selectedMember && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Member Details</h3>
              <button
                onClick={closeMemberDetails}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Picture Section */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <div className="w-32 h-32 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-16 h-16 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{selectedMember.name}</h4>
                  <p className="text-sm text-gray-600 mb-1">{selectedMember.designation}</p>
                  <p className="text-sm text-gray-600 mb-4">{selectedMember.department}</p>
                </div>
              </div>

              {/* Member Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <p className="text-gray-900 font-medium">{selectedMember.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <p className="text-gray-900 font-medium">{selectedMember.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <p className="text-gray-900 font-medium">{selectedMember.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Work Information */}
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Work Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                      <p className="text-gray-900 font-medium">{selectedMember.empId}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                      <p className="text-gray-900 font-medium">{selectedMember.department}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                      <p className="text-gray-900 font-medium">{selectedMember.designation}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Joining Date</label>
                      <p className="text-gray-900 font-medium">{selectedMember.joiningDate}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reporting Manager</label>
                      <p className="text-gray-900 font-medium">{selectedMember.reportingManager}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-yellow-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <p className="text-gray-900 font-medium">{selectedMember.address}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Name</label>
                        <p className="text-gray-900 font-medium">{selectedMember.emergencyContactName}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact Number</label>
                        <p className="text-gray-900 font-medium">{selectedMember.emergencyContact}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="bg-purple-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account Number</label>
                      <p className="text-gray-900 font-medium">{selectedMember.bankAccount}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                      <p className="text-gray-900 font-medium">{selectedMember.ifscCode}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                      <p className="text-gray-900 font-medium">{selectedMember.panNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Aadhar Number</label>
                      <p className="text-gray-900 font-medium">{selectedMember.aadharNumber}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeMemberDetails}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md text-sm font-medium"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium">
                Edit Member
              </button>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium">
                Delete Member
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeamInchargeDashboard;