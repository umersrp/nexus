'use client';
import { Delete, Get, Patch } from '@/Axios/AxiosFunctions';
import IconBtn from '@/components/IconBtn';
import SideBarSkeleton from '@/components/SideBarSkeleton';
import TableComponent from '@/components/TableComponent';
import { apiHeader, BaseURL } from '@/config/apiUrl';
import AreYouSureModal from '@/modals/AreYouSureModal';
import ViewUserModal from '@/modals/ViewUserModal';
import { Col, Row, Skeleton, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { AiFillDelete, AiFillEye } from 'react-icons/ai';
import {
  FaBookOpen,
  FaLock,
  FaUnlock,
  FaUsers,
  FaUserShield,
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  Cell,
  Pie,
  PieChart,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';
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
    const apiResponse = await Get(
      url,

      accessToken
    );
    setLoading(false);

    if (apiResponse !== undefined) {
      // Expecting { success, data: { users, courses, enrollments, revenue, quizzes } }
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

      toast.success(
        `User has been ${['active', 'approved'].includes(response?.data?.data?.status)
          ? 'activated'
          : 'deactivated'
        } successfully!`
      );

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
  // Synthetic but safe datasets (until backend provides timeseries)
  const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  const userGrowthData = months.map((m, idx) => ({
    month: m,
    newUsers: idx === months.length - 1 ? (users?.newThisMonth || 0) : 0,
  }));
  const revenueTrendData = months.map((m, idx) => ({
    month: m,
    revenue: idx === months.length - 1 ? (Number(revenue?.thisMonth) || 0) : 0,
  }));
  const courseBars = [
    { name: 'Published', value: courses?.published || 0 },
    { name: 'Pending', value: courses?.pendingApproval || 0 },
    { name: 'Draft', value: (courses?.total || 0) - (courses?.published || 0) - (courses?.pendingApproval || 0) },
  ];
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
      icon: <FaUsers size={20} color={'#1e3a8a'} />,
      subtitle: `Total $${(revenue?.total || 0).toFixed ? revenue?.total?.toFixed(2) : revenue?.total || 0}`
    },
    {
      title: 'Enrollments (This Week)',
      value: enrollments?.thisWeek,
      icon: <FaUsers size={20} color={'#1e3a8a'} />,
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
      toast.success(`User has been deleted successfully!`);

      setShowModal('');
      setSelectedItem(null);
    }
  };
  const config = {
    data: responseData?.ratings ? responseData?.ratings : [],
    angleField: 'value',
    colorField: 'rating',
    label: {
      text: 'value',
      position: 'outside',
      content: ({ rating, value }) => `${rating}: ${value}`,
      style: {
        fontWeight: 'bold',
      },
    },
    legend: {
      color: {
        title: false,
        position: 'right',
        rowPadding: 5,
      },
    },
  };

  const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#AF19FF',
    '#ff19a2',
    '#4d9906',
  ];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill='white'
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline='central'
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ payload, label, active }) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0];

      return (
        <div
          className='custom-tooltip'
          style={{
            backgroundColor: 'white',
            padding: '10px',
            border: '1px solid #ddd',
          }}
        >
          <p>{`Rating: ${name}`}</p>
          <p>{`Total: ${value}`}</p>
        </div>
      );
    }
    return <p>No Data</p>;
  };
  return (
    <SideBarSkeleton heading={'Dashboard'}>
      <div className={classes?.mainContainer}>
        <>
          {/* <div className={[classes?.headingContainer, "mb-5"].join(" ")}>
            <Input
              type={"text"}
              placeholder={`Search name or email`}
              value={search}
              setter={setSearch}
            />
            <DropDown
              options={userStatusOptions}
              placeholder="Select Status"
              onChange={(e) => {
                setStatus(e);
              }}
              value={status}
              variant="web"
              customStyle={{ width: "200px" }}
              isSearchable
              label={"Status: "}
              labelClassName={"!text-black dark:!text-white !mb-0"}
              containerClass="!flex-row items-center gap-2"
            />
          </div> */}

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

          {/* Charts Section (Premium Layout) */}
          <Row className='mb-[40px]' gutter={[16, 16]}>
            <Col md={16}>
              <div className='px-5 py-4 rounded-xl border border-gray-200 bg-white shadow-sm'>
                <h6 className='text-gray-800 text-lg font-semibold mb-4'>New Users</h6>
                <div className='h-72'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={userGrowthData} barSize={26}>
                      <CartesianGrid strokeDasharray='3 3' vertical={false} />
                      <XAxis dataKey='month' tick={{ fill: '#6b7280' }} />
                      <YAxis tick={{ fill: '#6b7280' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey='newUsers' fill='#2563eb' radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Col>
            <Col md={8}>
              <div className='px-5 py-4 rounded-xl border border-gray-200 bg-white shadow-sm'>
                <h6 className='text-gray-800 text-lg font-semibold mb-4'>Users Split</h6>
                <div className='h-72 flex items-center justify-center'>
                  <PieChart width={280} height={230}>
                    <Pie
                      data={[
                        { name: 'Active', value: users?.active || 0, fill: '#10b981' },
                        { name: 'Inactive', value: (users?.total || 0) - (users?.active || 0), fill: '#f59e0b' },
                      ]}
                      cx='50%'
                      cy='50%'
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={85}
                      dataKey='value'
                    >
                      {[
                        { name: 'Active', value: users?.active || 0, fill: '#10b981' },
                        { name: 'Inactive', value: (users?.total || 0) - (users?.active || 0), fill: '#f59e0b' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </div>
              </div>
            </Col>
          </Row>

          <Row className='mb-[40px]' gutter={[16, 16]}>
            <Col md={16}>
              <div className='px-5 py-4 rounded-xl border border-gray-200 bg-white shadow-sm'>
                <h6 className='text-gray-800 text-lg font-semibold mb-4'>Revenue Trend</h6>
                <div className='h-72'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <AreaChart data={revenueTrendData}>
                      <defs>
                        <linearGradient id='colorRev' x1='0' y1='0' x2='0' y2='1'>
                          <stop offset='5%' stopColor='#16a34a' stopOpacity={0.6} />
                          <stop offset='95%' stopColor='#16a34a' stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray='3 3' vertical={false} />
                      <XAxis dataKey='month' tick={{ fill: '#6b7280' }} />
                      <YAxis tick={{ fill: '#6b7280' }} />
                      <Tooltip />
                      <Area type='monotone' dataKey='revenue' stroke='#16a34a' fillOpacity={1} fill='url(#colorRev)' />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Col>
            <Col md={8}>
              <div className='px-5 py-4 rounded-xl border border-gray-200 bg-white shadow-sm'>
                <h6 className='text-gray-800 text-lg font-semibold mb-4'>Courses Breakdown</h6>
                <div className='h-72'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart data={courseBars} barSize={26}>
                      <CartesianGrid strokeDasharray='3 3' vertical={false} />
                      <XAxis dataKey='name' tick={{ fill: '#6b7280' }} />
                      <YAxis tick={{ fill: '#6b7280' }} />
                      <Tooltip />
                      <Bar dataKey='value' fill='#7c3aed' radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Col>
          </Row>

          <Row className='mb-[40px]' gutter={[16, 16]}>
            <Col md={8}>
              <div className='px-5 py-4 rounded-xl border border-gray-200 bg-white shadow-sm'>
                <h6 className='text-gray-800 text-lg font-semibold mb-4'>Quiz Performance</h6>
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
              </div>
            </Col>
            <Col md={8}>
              <div className='px-5 py-4 rounded-xl border border-gray-200 bg-white shadow-sm'>
                <h6 className='text-gray-800 text-lg font-semibold mb-4'>Enrollment Stats</h6>
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
              </div>
            </Col>
            <Col md={8}>
              <div className='px-5 py-4 rounded-xl border border-gray-200 bg-white shadow-sm'>
                <h6 className='text-gray-800 text-lg font-semibold mb-4'>Revenue Breakdown</h6>
                <div className='space-y-3'>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>Total Revenue</span>
                    <span className='font-semibold text-gray-900'>${(revenue?.total || 0).toFixed ? revenue?.total?.toFixed(2) : revenue?.total || 0}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>This Month</span>
                    <span className='font-semibold text-green-600'>${(revenue?.thisMonth || 0).toFixed ? revenue?.thisMonth?.toFixed(2) : revenue?.thisMonth || 0}</span>
                  </div>
                  <div className='flex items-center justify-center mt-4'>
                    <div className='w-16 h-16 rounded-full bg-green-100 flex items-center justify-center'>
                      <span className='text-green-600 font-bold text-lg'>$</span>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>

          <h5 className='text-[var(--primary-color)] mb-2 mt-5'>Users</h5>
          <TableComponent
            columns={columns}
            data={Array.isArray(responseData?.users) ? responseData?.users : []}
            isLoading={loading}
            className={classes.table}
          />
        </>
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
    </SideBarSkeleton>
  );
};

export default AdminDashboard;
