// modals/ViewAdminModal.js
import { Button, Tag, Card, Row, Col, Descriptions, Avatar } from 'antd';
import ModalSkeleton from '../ModalSkeleton';
import { 
  UserOutlined, 
  MailOutlined, 
  SafetyCertificateOutlined, 
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

const ViewAdminModal = ({ show, onClose, data }) => {
  if (!data) return null;

  const getStatusIcon = (status) => {
    return status === 'active' ? 
      <CheckCircleOutlined className="text-green-500" /> : 
      <CloseCircleOutlined className="text-red-500" />;
  };

  const getRoleColor = (role) => {
    const colors = {
      'Super Admin': 'blue',
      'Admin': 'green',
      'Document Approver': 'orange'
    };
    return colors[role] || 'default';
  };

  return (
    <ModalSkeleton
      header={
        <div className="flex items-center gap-3">
          <Avatar size={40} icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-800 m-0">{data.firstName} {data.lastName}</h2>
            <p className="text-gray-600 m-0">{data.email}</p>
          </div>
        </div>
      }
      show={show}
      setShow={onClose}
      size="lg"
    >
      <div className="space-y-6">
        {/* Basic Information Card */}
        <Card 
          title={
            <span className="flex items-center gap-2 text-blue-600">
              <UserOutlined />
              Basic Information
            </span>
          } 
          className="border-2 border-blue-100 shadow-sm rounded-xl"
        >
          <Row gutter={[16, 16]}>
            <Col span={24} md={12}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="First Name" className="font-semibold">
                  {data.firstName}
                </Descriptions.Item>
                <Descriptions.Item label="Last Name" className="font-semibold">
                  {data.lastName}
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={24} md={12}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Email" className="font-semibold">
                  <span className="flex items-center gap-1">
                    <MailOutlined className="text-blue-500" />
                    {data.email}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Created" className="font-semibold">
                  <span className="flex items-center gap-1">
                    <CalendarOutlined className="text-green-500" />
                    {data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </Card>

        {/* Role & Status Card */}
        <Card 
          title={
            <span className="flex items-center gap-2 text-green-600">
              <SafetyCertificateOutlined />
              Role & Status
            </span>
          } 
          className="border-2 border-green-100 shadow-sm rounded-xl"
        >
          <Row gutter={[16, 16]}>
            <Col span={24} md={12}>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Role</label>
                <Tag 
                  color={getRoleColor(data.role)} 
                  className="px-3 py-1 text-base font-semibold"
                >
                  {data.role}
                </Tag>
              </div>
            </Col>
            <Col span={24} md={12}>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Status</label>
                <div className="flex items-center gap-2">
                  {getStatusIcon(data.status)}
                  <Tag 
                    color={data.status === 'active' ? 'green' : 'red'}
                    className="px-3 py-1 text-base font-semibold capitalize"
                  >
                    {data.status}
                  </Tag>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Additional Information */}
        <Card 
          title="Additional Details" 
          className="border-2 border-purple-100 shadow-sm rounded-xl"
        >
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Admin ID" className="font-semibold">
              <code className="bg-gray-100 px-2 py-1 rounded">{data._id}</code>
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated" className="font-semibold">
              {data.updatedAt ? new Date(data.updatedAt).toLocaleString() : 'Never updated'}
            </Descriptions.Item>
            <Descriptions.Item label="Account Type" className="font-semibold">
              <Tag color="purple">Administrator</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button 
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-300 text-gray-700 hover:border-gray-400 font-medium"
          >
            Close
          </Button>
          <Button 
            type="primary"
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 border-none hover:from-blue-700 hover:to-blue-800 font-semibold"
          >
            Edit Profile
          </Button>
        </div>
      </div>
    </ModalSkeleton>
  );
};

export default ViewAdminModal;