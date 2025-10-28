'use client';
import { Delete, Patch, Post, Get } from '@/Axios/AxiosFunctions';
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
import Cookies from 'js-cookie';
import { decryptToken } from '@/config/helper';
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

  const getAuthToken = () => {
    if (typeof window === 'undefined') return undefined;
    const enc = Cookies.get('xpdx');
    const raw = Cookies.get('token');
    const ls = localStorage.getItem('token');
    const dec = enc ? decryptToken(enc) : null;
    // Prefer fresh cookie token to avoid stale localStorage tokens
    return dec || raw || accessToken || ls || undefined;
  };

  useEffect(() => {
    setPage(1);
    getAllData(1);
  }, [debounceSearch, status]);

  const getAllData = async (pageNo) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('role', 'learner');
      params.set('page', String(pageNo || 1));
      params.set('limit', String(recordsLimit || 20));
      if (typeof debounceSearch === 'string' && debounceSearch.trim().length > 0) {
        params.set('search', debounceSearch.trim());
      }
      params.set('_ts', Date.now().toString());

      const url = BaseURL(`users?${params.toString()}`);
      const res = await Get(url, getAuthToken(), true);

      const items = res?.data?.data?.users
        || res?.data?.users
        || res?.data?.data?.items
        || res?.data?.data?.results
        || res?.data?.results
        || [];
      const normalized = (Array.isArray(items) ? items : []).map((u) => ({
        ...u,
        status: u?.status || (u?.isActive === true ? 'active' : u?.isActive === false ? 'deactive' : 'pending'),
      }));
      const totalPagesFromApi = res?.data?.data?.pagination?.totalPages
        || res?.data?.pagination?.totalPages
        || res?.data?.data?.totalPages
        || res?.data?.totalPages
        || 1;

      setResponseData(normalized);
      setTotalPages(Number(totalPagesFromApi) > 0 ? Number(totalPagesFromApi) : 1);
    } finally {
      setLoading(false);
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
