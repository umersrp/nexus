// modals/CreateAdminModal.js
import Input from '@/components/Input';
import DropDown from '@/components/DropDown';
import { Button, Checkbox, Divider, Collapse, Steps, Card, Row, Col } from 'antd';
import { useState } from 'react';
import { toast } from 'react-toastify';
import ModalSkeleton from '../ModalSkeleton';
import { 
  UserOutlined, 
  SafetyCertificateOutlined, 
  FileTextOutlined,
  CheckCircleOutlined 
} from '@ant-design/icons';

const { Panel } = Collapse;
const { Step } = Steps;

const CreateAdminModal = ({ show, onClose, onSubmit, loading }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    permissions: {
      userManagement: { view: false, create: false, update: false, delete: false },
      rolesPermissions: { view: false, create: false, update: false, delete: false },
      aiDocuments: { view: false, create: false, update: false, delete: false },
      documentApproval: { view: false, create: false, update: false, delete: false },
      feedback: { view: false, create: false, update: false, delete: false },
      invoice: { view: false, create: false, update: false, delete: false },
    }
  });

  const roleOptions = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'document_approver', label: 'Document Approver' },
  ];

  const steps = [
    {
      title: 'Basic Info',
      icon: <UserOutlined />,
    },
    {
      title: 'Permissions',
      icon: <SafetyCertificateOutlined />,
    },
    {
      title: 'Review',
      icon: <FileTextOutlined />,
    },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePermissionChange = (section, permission, value) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [section]: {
          ...prev.permissions[section],
          [permission]: value
        }
      }
    }));
  };

  const handleSelectAll = (section, value) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [section]: {
          view: value,
          create: value,
          update: value,
          delete: value
        }
      }
    }));
  };

  const nextStep = () => {
    if (currentStep === 0) {
      if (!formData.firstName || !formData.email || !formData.role) {
        toast.error('Please fill all required fields');
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const PermissionSection = ({ title, section, permissions }) => (
    <Card 
      size="small" 
      className="mb-4 border-2 border-gray-100 hover:border-blue-200 transition-all"
    >
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-blue-700 text-sm">{title}</h4>
        <Checkbox
          onChange={(e) => handleSelectAll(section, e.target.checked)}
          checked={Object.values(permissions).every(Boolean)}
          className="font-medium"
        >
          Select All
        </Checkbox>
      </div>
      <Row gutter={[16, 8]}>
        <Col span={12}>
          <Checkbox
            checked={permissions.view}
            onChange={(e) => handlePermissionChange(section, 'view', e.target.checked)}
            className="w-full py-1"
          >
            <span className="font-medium">View</span>
          </Checkbox>
        </Col>
        <Col span={12}>
          <Checkbox
            checked={permissions.create}
            onChange={(e) => handlePermissionChange(section, 'create', e.target.checked)}
            className="w-full py-1"
          >
            <span className="font-medium">Create</span>
          </Checkbox>
        </Col>
        <Col span={12}>
          <Checkbox
            checked={permissions.update}
            onChange={(e) => handlePermissionChange(section, 'update', e.target.checked)}
            className="w-full py-1"
          >
            <span className="font-medium">Update</span>
          </Checkbox>
        </Col>
        <Col span={12}>
          <Checkbox
            checked={permissions.delete}
            onChange={(e) => handlePermissionChange(section, 'delete', e.target.checked)}
            className="w-full py-1"
          >
            <span className="font-medium">Delete</span>
          </Checkbox>
        </Col>
      </Row>
    </Card>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="First Name *"
                placeholder="Enter first name"
                value={formData.firstName}
                setter={(value) => handleInputChange('firstName', value)}
                className="border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                inputContainerClass="input-plain"
                autoComplete="off"
              />
              <Input
                label="Last Name"
                placeholder="Enter last name"
                value={formData.lastName}
                setter={(value) => handleInputChange('lastName', value)}
                className="border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                inputContainerClass="input-plain"
                autoComplete="off"
              />
            </div>
            
            <Input
              label="Email *"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              setter={(value) => handleInputChange('email', value)}
              className="border-2 border-gray-200 focus:border-blue-500 rounded-lg"
              inputContainerClass="input-plain"
              autoComplete="off"
            />
            
            <DropDown
              label="Role *"
              options={roleOptions}
              placeholder="Select Administrator Role"
              value={formData.role}
              onChange={(value) => handleInputChange('role', value)}
              isSearchable
              variant="web"
              customStyle={{ background: '#ffffff', border: '1px solid #d1d5db', boxShadow: 'none', borderRadius: '8px', minHeight: '40px' }}
              containerClass="dropdown-plain"
              className="rounded-lg"
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <Collapse defaultActiveKey={['1']} className="permissions-collapse">
              <Panel header="Super Admin Rights" key="1" className="font-semibold">
                <PermissionSection
                  title="User Management"
                  section="userManagement"
                  permissions={formData.permissions.userManagement}
                />
                <PermissionSection
                  title="Roles & Permissions"
                  section="rolesPermissions"
                  permissions={formData.permissions.rolesPermissions}
                />
              </Panel>
              
              <Panel header="AI Documents" key="2" className="font-semibold">
                <PermissionSection
                  title="Generate AI Documents"
                  section="aiDocuments"
                  permissions={formData.permissions.aiDocuments}
                />
                <PermissionSection
                  title="Document Approval"
                  section="documentApproval"
                  permissions={formData.permissions.documentApproval}
                />
              </Panel>
              
              <Panel header="Feedback Management" key="3" className="font-semibold">
                <PermissionSection
                  title="Feedback System"
                  section="feedback"
                  permissions={formData.permissions.feedback}
                />
              </Panel>
              
              <Panel header="Invoice Management" key="4" className="font-semibold">
                <PermissionSection
                  title="Invoice System"
                  section="invoice"
                  permissions={formData.permissions.invoice}
                />
              </Panel>
            </Collapse>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 p-4 bg-blue-50 rounded-lg">
            <Card title="Admin Details" className="border-2 border-blue-200">
              <Row gutter={[16, 12]}>
                <Col span={12}>
                  <strong>Name:</strong> {formData.firstName} {formData.lastName}
                </Col>
                <Col span={12}>
                  <strong>Email:</strong> {formData.email}
                </Col>
                <Col span={12}>
                  <strong>Role:</strong> <span className="text-blue-600 font-semibold">{formData.role?.label}</span>
                </Col>
                <Col span={24}>
                  <strong>Permissions:</strong> 
                  <div className="mt-2 space-y-2">
                    {Object.entries(formData.permissions).map(([section, perms]) => (
                      <div key={section} className="flex items-center gap-2">
                        <CheckCircleOutlined className="text-green-500" />
                        <span className="capitalize">{section.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="text-blue-600">
                          {Object.entries(perms).filter(([_, val]) => val).map(([key]) => key).join(', ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ModalSkeleton
      header="Create New Administrator"
      show={show}
      setShow={onClose}
      size="xl"
      headerStyles={{ background: '#1E3A8A' }}
    >
      <div className="space-y-6">
        {/* Steps */}
        <Steps current={currentStep} className="custom-steps">
          {steps.map((step, index) => (
            <Step key={index} title={step.title} icon={step.icon} />
          ))}
        </Steps>

        {/* Step Content */}
        <div className="min-h-64">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <div>
            {currentStep > 0 && (
              <Button 
                onClick={prevStep}
                className="px-6 py-2 h-auto border-2 border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600 font-medium"
              >
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={onClose}
              className="px-6 py-2 h-auto border-2 border-red-300 text-red-600 hover:border-red-500 hover:text-red-700 font-medium"
            >
              Cancel
            </Button>
            
            {currentStep < steps.length - 1 ? (
              <Button 
                type="primary"
                onClick={nextStep}
                className="px-8 py-2 h-auto font-semibold shadow-lg"
                style={{ background: '#1E3A8A', border: 'none' }}
              >
                Next Step
              </Button>
            ) : (
              <Button 
                type="primary"
                onClick={handleSubmit}
                loading={loading}
                className="px-8 py-2 h-auto font-semibold shadow-lg"
                style={{ background: '#1E3A8A', border: 'none' }}
                icon={<CheckCircleOutlined />}
              >
                Create Administrator
              </Button>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-steps {
          display: flex;
          justify-content: center;
        }
        /* Plain input/dropdown containers to avoid teal backgrounds */
        :global(.input-plain) {
          background: #ffffff !important;
          border: 1px solid #d1d5db !important;
          box-shadow: none !important; /* remove inner box effect */
          border-radius: 10px !important;
          min-height: 48px !important;
          transition: border-color .15s ease, box-shadow .15s ease;
        }
        :global(.input-plain:hover) { border-color: #c5cbd5 !important; }
        :global(.input-plain:focus-within) { border-color: #1e3a8a !important; box-shadow: 0 0 0 3px rgba(30,58,138,0.12) !important; }
        :global(.input-plain input) {
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
          outline: none !important;
          padding: 12px 14px !important;
          font-size: 15px !important;
          height: 46px !important;
        }
        :global(.input-plain input::placeholder) { color: #9ca3af !important; }
        :global(.dropdown-plain .DropdownOptionContainer__control) {
          background: #ffffff !important;
          border: 1px solid #d1d5db !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04) !important;
          min-height: 46px !important;
          border-radius: 10px !important;
        }
        /* Fix chrome autofill/light-blue inner boxes */
        :global(input:-webkit-autofill),
        :global(input:-webkit-autofill:hover),
        :global(input:-webkit-autofill:focus) {
          -webkit-text-fill-color: inherit;
          -webkit-box-shadow: 0 0 0px 1000px #ffffff inset !important;
          box-shadow: 0 0 0px 1000px #ffffff inset !important;
          background: #ffffff !important;
          caret-color: auto;
        }
        .custom-steps :global(.ant-steps-item-title) {
          font-weight: 600;
        }
        .custom-steps :global(.ant-steps-item-process .ant-steps-item-icon) {
          background: #1890ff;
          border-color: #1890ff;
        }
        .custom-steps :global(.ant-steps-item-finish .ant-steps-item-icon) {
          background: #52c41a;
          border-color: #52c41a;
        }
        .permissions-collapse :global(.ant-collapse-header) {
          background: #f8fbff !important;
          border-radius: 10px !important;
          margin-bottom: 10px;
          border: 1px solid #e6eefb;
        }
      `}</style>
    </ModalSkeleton>
  );
};

export default CreateAdminModal;