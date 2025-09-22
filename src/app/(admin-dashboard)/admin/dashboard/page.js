'use client';
import { Delete, Get, Patch } from '@/Axios/AxiosFunctions';
import IconBtn from '@/components/IconBtn';
import SideBarSkeleton from '@/components/SideBarSkeleton';
import TableComponent from '@/components/TableComponent';
import UserGraph from '@/components/UsersGraph';
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
import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import classes from './users.module.css';
const StatsCard = ({ value, title, icon, loading }) => {
  return (
    <div className='bg-[var(--primary-color)] px-5 py-4 rounded-[20px] shadow-[#24234254] shadow'>
      <span className='text-end'>{icon}</span>
      <h6 className='text-[var(--white-color)] '>{title}</h6>

      {loading ? (
        <Skeleton.Input
          active={loading}
          size='default'
          style={{ width: '50%' }}
          block={true}
          className='mt-2'
        ></Skeleton.Input>
      ) : (
        <h5 className='text-[var(--secondary-color)] leading-[1] mt-3'>
          {value}
        </h5>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const accessToken = useSelector((state) => state.authReducer.accessToken);
  const [responseData, setResponseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState('');
  const apiUrl = BaseURL('admin/users');
  const statsUrl = BaseURL('admin/stats');

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
      setResponseData(apiResponse?.data);
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
        `User has been ${
          ['active', 'approved'].includes(response?.data?.data?.status)
            ? 'activated'
            : 'deactivated'
        } successfully!`
      );

      setShowModal('');
      setSelectedItem(null);
    }
  };
  const stats = [
    {
      title: 'Total Users',
      value: responseData?.totalUsers,
      icon: <FaUsers size={45} color={'rgba(255, 255, 255, 0.6)'} />,
    },
    {
      title: 'Subscribed Users',
      value: responseData?.subscribedUsers,
      icon: <FaUserShield size={45} color={'rgba(255, 255, 255, 0.6)'} />,
    },
    {
      title: 'Total Sessions',
      value: responseData?.totalSessions,
      icon: <FaBookOpen size={45} color={'rgba(255, 255, 255, 0.6)'} />,
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
            {stats?.map((item) => (
              <Col md={8}>
                <StatsCard
                  title={item?.title}
                  value={item?.value}
                  icon={item?.icon}
                  loading={loading}
                />
              </Col>
            ))}
          </Row>

          <Row gutter={[16, 16]}>
            <Col md={24}>
              <UserGraph values={responseData?.months ?? []} />
            </Col>
            <Col md={12}>
              <UserGraph
                values={responseData?.months ?? []}
                yField='sessions'
                title={'Sessions'}
                type='column'
              />
            </Col>
            <Col md={12}>
              <div
                className='px-3 py-5 shadow-[#24234254] shadow rounded-[20px] dark:!bg-[var(--table-bg-color)]
    dark:text-white'
              >
                <h5 className=' text-[var(--primary-color)]'>Ratings</h5>
                <PieChart width={400} height={340} className='pie-chart'>
                  <Pie
                    data={responseData?.ratings}
                    cx='50%'
                    cy='50%'
                    labelLine={false}
                    label={renderCustomizedLabel}
                    fill='red'
                    dataKey='value'
                  >
                    {responseData?.ratings?.map((entry, index) => (
                      <>
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      </>
                    ))}
                  </Pie>
                  <Tooltip content={CustomTooltip} />
                </PieChart>
              </div>
            </Col>
          </Row>

          <h5 className='text-[var(--primary-color)] mb-2 mt-5'>Users</h5>
          <TableComponent
            columns={columns}
            data={responseData?.users}
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
        subTitle={`Do you really want to ${
          ['active', 'approved'].includes(selectedItem?.status)
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
