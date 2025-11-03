'use client';
import { Delete, Patch, Post } from '@/Axios/AxiosFunctions';
import IconBtn from '@/components/IconBtn';
import Input from '@/components/Input';
import { apiHeader, BaseURL, recordsLimit } from '@/config/apiUrl';
import useDebounce from '@/custom-hooks/useDebounce';
import DropDown from '@/components/DropDown';
import TableComponent from '@/components/TableComponent';
import { emailStatusOptions } from '@/constant/commonData';
import { Tag } from 'antd';
import { useEffect, useState } from 'react';
import { AiFillEye } from 'react-icons/ai';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ViewEmailContentModal from '../../../../modals/ViewEmailContentModal';
import classes from './emails.module.css';

const Users = () => {
  const accessToken = useSelector((state) => state.authReducer.accessToken);
  const [responseData, setResponseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState('');
  const [status, setStatus] = useState(emailStatusOptions[0]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const debounceSearch = useDebounce(search, 500);

  const apiUrl = BaseURL('email');

  useEffect(() => {
    setPage(1);
    getAllData(1);
  }, [debounceSearch, status]);

  const getAllData = async (pageNo) => {
    const url = `${apiUrl}/get-all-emails?page=${pageNo}&limit=${recordsLimit}`;
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
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
    },
    {
      title: 'Status',
      dataIndex: 'isSend',
      render: (text, record) => {
        const type = {
          true: 'green',
          false: 'orange',
        };
        return (
          <Tag color={type[text]} className='capitalize'>
            {text ? 'Sent' : 'Pending'}
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
          </div>
        );
      },
    },
  ];


  return (
    <>
      <div className={classes?.mainContainer}>
        <>
          <div className={[classes?.headingContainer, 'mb-5'].join(' ')}>
            <Input
              type={'text'}
              placeholder={`Search email`}
              value={search}
              setter={setSearch}
            />
            <DropDown
              options={emailStatusOptions}
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

      <ViewEmailContentModal
        show={showModal == 'view'}
        onClose={() => {
          setShowModal('');
          setSelectedItem(null);
        }}
        data={selectedItem}
      />
    </>
  );
};

export default Users;
