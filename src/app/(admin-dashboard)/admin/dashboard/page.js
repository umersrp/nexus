'use client';
import { Delete, Get, Patch } from '@/Axios/AxiosFunctions';
import IconBtn from '@/components/IconBtn';
import TableComponent from '@/components/TableComponent';
import { apiHeader, BaseURL } from '@/config/apiUrl';
import AreYouSureModal from '@/modals/AreYouSureModal';
import ViewUserModal from '@/modals/ViewUserModal';
import { Col, Row, Skeleton, Tag, Card, Statistic, Progress } from 'antd';
import { useEffect, useState } from 'react';
import { AiFillDelete, AiFillEye } from 'react-icons/ai';
import {
  FaBookOpen,
  FaLock,
  FaUnlock,
  FaUsers,
  FaUserShield,
  FaChartLine,
  FaMoneyBillWave,
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { notification } from 'antd';
import classes from './users.module.css';

const StatsCard = ({ value, title, icon, loading, subtitle }) => {
  return (
    <div className='px-5 py-4 rounded-xl border border-gray-200 bg-white shadow-sm'>
      <div className='flex items-start justify-between'>
        <div>
          <h6 className='text-gray-600 text-sm font-semibold'>{title}</h6>
          {loading ? (
            <Skeleton.Input active={loading} size='default' style={{ width: 100 }} className='mt-2' />
          ) : (
            <div className='mt-2'>
              <div className='text-2xl font-bold text-gray-900'>{value ?? 0}</div>
              {subtitle && <div className='text-xs text-gray-500 mt-1'>{subtitle}</div>}
            </div>
          )}
        </div>
        <div className='w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center'>
          {icon}
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const accessToken = useSelector((state) => state.authReducer.accessToken);
  const [responseData, setResponseData] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState('');
  const apiUrl = BaseURL('admin/users');
  const statsUrl = BaseURL('analytics/dashboard');

  useEffect(() => {
    getAllData();
  }, []);

  const getAllData = async () => {
    const url = `${statsUrl}`;
    setLoading(true);
    const apiResponse = await Get(url, accessToken);
    setLoading(false);

    if (apiResponse !== undefined) {
      setResponseData(apiResponse?.data?.data || {});
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      render: (text, record) => {
        return <>{`${record?.firstName} ${record?.lastName}`}</>;
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Age',
      dataIndex: 'age',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (text, record) => {
        const type = {
          active: 'green',
          approved: 'green',
          pending: 'orange',
          rejected: 'red',
          deactive: 'red',
        };
        return (
          <Tag color={type[text]} className='capitalize'>
            {text}
          </Tag>
        );
      },
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      render: (text, record) => {
        return (
          <div className='flex gap-3'>
            <IconBtn
              icon={<AiFillEye />}
              onClick={() => {
                setSelectedItem(record);
                setShowModal('view');
              }}
              title='View'
            />
            {!['pending', 'rejected'].includes(record?.status) && (
              <IconBtn
                icon={
                  ['approved', 'active']?.includes(record?.status) ? (
                    <FaLock />
                  ) : (
                    <FaUnlock />
                  )
                }
                onClick={() => {
                  setSelectedItem(record);
                  setShowModal('status');
                }}
                title={
                  ['approved', 'active']?.includes(record?.status)
                    ? 'Deactivate'
                    : 'Activate'
                }
              />
            )}
            <IconBtn
              icon={<AiFillDelete />}
              onClick={() => {
                setSelectedItem(record);
                setShowModal('delete');
              }}
              title='Delete'
            />
          </div>
        );
      },
    },
  ];

  const handleUpdateStatus = async () => {
    const url = `${apiUrl}/update-status/${selectedItem?._id}`;
    setSubmitLoading(true);
    const response = await Patch(
      url,
      {
        status: ['active', 'approved'].includes(selectedItem?.status)
          ? 'deactive'
          : 'active',
      },
      apiHeader(accessToken)
    );
    setSubmitLoading(false);

    if (response !== undefined) {
      const dataCopy = [...responseData?.users];
      dataCopy.splice(
        responseData?.users?.findIndex(
          (item) => item?._id === selectedItem?._id
        ),
        1,
        response?.data?.data
      );
      setResponseData({ ...responseData, users: dataCopy });

      notification.success({
        message: 'Success',
        description: `User has been ${['active', 'approved'].includes(response?.data?.data?.status)
          ? 'activated'
          : 'deactivated'
        } successfully!`,
      });

      setShowModal('');
      setSelectedItem(null);
    }
  };

  const users = responseData?.users || {};
  const courses = responseData?.courses || {};
  const enrollments = responseData?.enrollments || {};
  const revenue = responseData?.revenue || {};
  const quizzes = responseData?.quizzes || {};
  const activeRate = users?.total ? Math.round(((users?.active || 0) / users?.total) * 100) : 0;

  const stats = [
    {
      title: 'Total Users',
      value: users?.total,
      icon: <FaUsers size={20} color={'#1e3a8a'} />,
    },
    {
      title: 'Active Users',
      value: users?.active,
      icon: <FaUserShield size={20} color={'#1e3a8a'} />,
      subtitle: `${activeRate}% of total`
    },
    {
      title: 'New This Month',
      value: users?.newThisMonth,
      icon: <FaBookOpen size={20} color={'#1e3a8a'} />,
    },
    {
      title: 'Courses (Published)',
      value: `${courses?.published || 0}/${courses?.total || 0}`,
      icon: <FaBookOpen size={20} color={'#1e3a8a'} />,
      subtitle: `${courses?.pendingApproval || 0} pending approval`
    },
    {
      title: 'Revenue (This Month)',
      value: `$${(revenue?.thisMonth || 0).toFixed ? revenue?.thisMonth?.toFixed(2) : revenue?.thisMonth || 0}`,
      icon: <FaMoneyBillWave size={20} color={'#1e3a8a'} />,
      subtitle: `Total $${(revenue?.total || 0).toFixed ? revenue?.total?.toFixed(2) : revenue?.total || 0}`
    },
    {
      title: 'Enrollments (This Week)',
      value: enrollments?.thisWeek,
      icon: <FaChartLine size={20} color={'#1e3a8a'} />,
      subtitle: `Completion ${enrollments?.completionRate || 0}%`
    },
  ];

  const handleDelete = async () => {
    const url = `${apiUrl}/delete/${selectedItem?._id}`;
    setSubmitLoading('delete');
    const response = await Delete(url, null, accessToken);
    setSubmitLoading(false);

    if (response !== undefined) {
      const dataCopy = [...responseData?.users];
      dataCopy.splice(
        responseData?.users?.findIndex(
          (item) => item?._id === selectedItem?._id
        ),
        1
      );
      setResponseData({ ...responseData, users: dataCopy });
      notification.success({
        message: 'Success',
        description: 'User has been deleted successfully!',
      });

      setShowModal('');
      setSelectedItem(null);
    }
  };

  return (
    <>
      <div className={classes?.mainContainer}>
        <Row className='mb-[40px]' gutter={[16, 16]}>
          {stats?.map((item, index) => (
            <Col md={8} key={index}>
              <StatsCard
                title={item?.title}
                value={item?.value}
                icon={item?.icon}
                loading={loading}
                subtitle={item?.subtitle}
              />
            </Col>
          ))}
        </Row>

        {/* Simple Stats Cards instead of Charts */}
        <Row className='mb-[40px]' gutter={[16, 16]}>
          <Col md={8}>
            <Card title="User Distribution" className='h-full'>
              <div className='space-y-4'>
                <div>
                  <div className='flex justify-between mb-1'>
                    <span>Active Users</span>
                    <span>{users?.active || 0}</span>
                  </div>
                  <Progress 
                    percent={activeRate} 
                    strokeColor="#10b981"
                    showInfo={false}
                  />
                </div>
                <div>
                  <div className='flex justify-between mb-1'>
                    <span>Inactive Users</span>
                    <span>{(users?.total || 0) - (users?.active || 0)}</span>
                  </div>
                  <Progress 
                    percent={100 - activeRate} 
                    strokeColor="#f59e0b"
                    showInfo={false}
                  />
                </div>
              </div>
            </Card>
          </Col>
          
          <Col md={8}>
            <Card title="Course Status" className='h-full'>
              <div className='space-y-4'>
                <div>
                  <div className='flex justify-between mb-1'>
                    <span>Published</span>
                    <span>{courses?.published || 0}</span>
                  </div>
                  <Progress 
                    percent={courses?.total ? Math.round(((courses?.published || 0) / courses?.total) * 100) : 0} 
                    strokeColor="#2563eb"
                    showInfo={false}
                  />
                </div>
                <div>
                  <div className='flex justify-between mb-1'>
                    <span>Pending</span>
                    <span>{courses?.pendingApproval || 0}</span>
                  </div>
                  <Progress 
                    percent={courses?.total ? Math.round(((courses?.pendingApproval || 0) / courses?.total) * 100) : 0} 
                    strokeColor="#f59e0b"
                    showInfo={false}
                  />
                </div>
              </div>
            </Card>
          </Col>

          <Col md={8}>
            <Card title="Revenue Overview" className='h-full'>
              <div className='text-center'>
                <Statistic
                  title="This Month"
                  value={revenue?.thisMonth || 0}
                  precision={2}
                  prefix="$"
                  valueStyle={{ color: '#16a34a' }}
                />
                <Statistic
                  title="Total Revenue"
                  value={revenue?.total || 0}
                  precision={2}
                  prefix="$"
                  valueStyle={{ color: '#1e3a8a', fontSize: '18px' }}
                />
              </div>
            </Card>
          </Col>
        </Row>

        <Row className='mb-[40px]' gutter={[16, 16]}>
          <Col md={8}>
            <Card title="Quiz Performance" className='h-full'>
              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Total Attempts</span>
                  <span className='font-semibold text-gray-900'>{quizzes?.totalAttempts || 0}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Passed</span>
                  <span className='font-semibold text-green-600'>{quizzes?.passed || 0}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Average Score</span>
                  <span className='font-semibold text-blue-600'>{quizzes?.averageScore || 0}%</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Pass Rate</span>
                  <span className='font-semibold text-purple-600'>{quizzes?.passRate || 0}%</span>
                </div>
              </div>
            </Card>
          </Col>
          
          <Col md={8}>
            <Card title="Enrollment Stats" className='h-full'>
              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Total Enrollments</span>
                  <span className='font-semibold text-gray-900'>{enrollments?.total || 0}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Active</span>
                  <span className='font-semibold text-green-600'>{enrollments?.active || 0}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Completed</span>
                  <span className='font-semibold text-blue-600'>{enrollments?.completed || 0}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>This Week</span>
                  <span className='font-semibold text-purple-600'>{enrollments?.thisWeek || 0}</span>
                </div>
              </div>
            </Card>
          </Col>

          <Col md={8}>
            <Card title="User Activity" className='h-full'>
              <div className='space-y-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>New This Month</span>
                  <span className='font-semibold text-green-600'>{users?.newThisMonth || 0}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Active Rate</span>
                  <span className='font-semibold text-blue-600'>{activeRate}%</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Total Sessions</span>
                  <span className='font-semibold text-purple-600'>{users?.totalSessions || 0}</span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Avg. Time</span>
                  <span className='font-semibold text-orange-600'>{users?.avgSessionTime || '0m'}</span>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <h5 className='text-[var(--primary-color)] mb-2 mt-5'>Users</h5>
        <TableComponent
          columns={columns}
          data={Array.isArray(responseData?.users) ? responseData?.users : []}
          isLoading={loading}
          className={classes.table}
        />
      </div>

      <ViewUserModal
        show={showModal == 'view'}
        onClose={() => {
          setShowModal(false);
          setSelectedItem(null);
        }}
        data={selectedItem}
      />

      <AreYouSureModal
        show={showModal == 'status'}
        setShow={setShowModal}
        subTitle={`Do you really want to ${['active', 'approved'].includes(selectedItem?.status)
            ? 'deactivate'
            : 'activate'
          } this item?`}
        onClick={handleUpdateStatus}
        isApiCall={submitLoading}
      />
      <AreYouSureModal
        show={showModal == 'delete'}
        setShow={setShowModal}
        subTitle={`Do you really want to Delete this User?`}
        onClick={handleDelete}
        isApiCall={submitLoading == 'delete'}
      />
    </>
  );
};

export default AdminDashboard;