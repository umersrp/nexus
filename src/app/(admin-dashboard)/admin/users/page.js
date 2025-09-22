'use client';
import { Delete, Patch, Post } from '@/Axios/AxiosFunctions';
import DropDown from '@/components/DropDown';
import IconBtn from '@/components/IconBtn';
import Input from '@/components/Input';
import SideBarSkeleton from '@/components/SideBarSkeleton';
import TableComponent from '@/components/TableComponent';
import { apiHeader, BaseURL, recordsLimit } from '@/config/apiUrl';
import { userStatusOptions } from '@/constant/commonData';
import useDebounce from '@/custom-hooks/useDebounce';
import AreYouSureModal from '@/modals/AreYouSureModal';
import ViewUserModal from '@/modals/ViewUserModal';
import { Tag } from 'antd';
import { useEffect, useState } from 'react';
import { AiFillDelete, AiFillEye } from 'react-icons/ai';
import { FaLock, FaUnlock } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import classes from './users.module.css';

const Users = () => {
  const accessToken = useSelector((state) => state.authReducer.accessToken);
  const [responseData, setResponseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState('');
  const [status, setStatus] = useState(userStatusOptions[0]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const debounceSearch = useDebounce(search, 500);

  const apiUrl = BaseURL('admin/users');

  useEffect(() => {
    setPage(1);
    getAllData(1);
  }, [debounceSearch, status]);

  const getAllData = async (pageNo) => {
    const url = `${apiUrl}/get-all-users?page=${pageNo}&limit=${recordsLimit}`;
    setLoading(true);
    const apiResponse = await Post(
      url,
      { search, status: status?.value },
      apiHeader(accessToken)
    );
    setLoading(false);

    if (apiResponse !== undefined) {
      setResponseData(apiResponse?.data?.data);
      setTotalPages(apiResponse?.data?.totalCount);
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
    setSubmitLoading('update');
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
      const dataCopy = [...responseData];
      dataCopy.splice(
        responseData?.findIndex((item) => item?._id === selectedItem?._id),
        1,
        response?.data?.data
      );
      setResponseData(dataCopy);
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

  const handleDelete = async () => {
    const url = `${apiUrl}/delete/${selectedItem?._id}`;
    setSubmitLoading('delete');
    const response = await Delete(url, null, accessToken);
    setSubmitLoading(false);

    if (response !== undefined) {
      const dataCopy = [...responseData];
      dataCopy.splice(
        responseData?.findIndex((item) => item?._id === selectedItem?._id),
        1
      );
      setResponseData(dataCopy);
      toast.success(`User has been deleted successfully!`);

      setShowModal('');
      setSelectedItem(null);
    }
  };
  return (
    <SideBarSkeleton heading={'Users'}>
      <div className={classes?.mainContainer}>
        <>
          <div className={[classes?.headingContainer, 'mb-5'].join(' ')}>
            <Input
              type={'text'}
              placeholder={`Search name or email`}
              value={search}
              setter={setSearch}
            />
            <DropDown
              options={userStatusOptions}
              placeholder='Select Status'
              onChange={(e) => {
                setStatus(e);
              }}
              value={status}
              variant='web'
              customStyle={{ width: '200px' }}
              isSearchable
              label={'Status: '}
              labelClassName={'!text-black dark:!text-white !mb-0'}
              containerClass='!flex-row items-center gap-2'
            />
          </div>
          <TableComponent
            columns={columns}
            data={responseData}
            isLoading={loading}
            className={classes.table}
            page={page}
            totalPages={totalPages}
            onPageChange={(e) => {
              getAllData(e);
              setPage(e);
            }}
          />
        </>
      </div>

      <ViewUserModal
        show={showModal == 'view'}
        onClose={() => {
          setShowModal('');
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
        isApiCall={submitLoading == 'update'}
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

export default Users;
