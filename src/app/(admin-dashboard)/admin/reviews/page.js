'use client';
import { Post } from '@/Axios/AxiosFunctions';
import Input from '@/components/Input';
import SideBarSkeleton from '@/components/SideBarSkeleton';
import { apiHeader, BaseURL, recordsLimit } from '@/config/apiUrl';
import useDebounce from '@/custom-hooks/useDebounce';
import TableComponent from '@/components/TableComponent';
import ViewUserModal from '@/modals/ViewUserModal';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import classes from './sessions.module.css';

import ViewPDFModal from '../../../../modals/ViewPDFModal';

const Reviews = () => {
  const accessToken = useSelector((state) => state.authReducer.accessToken);
  const [responseData, setResponseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const debounceSearch = useDebounce(search, 500);

  const apiUrl = BaseURL('admin/sessions');

  useEffect(() => {
    setPage(1);
    getAllData(1);
  }, [debounceSearch]);

  const getAllData = async (pageNo) => {
    const url = `${apiUrl}/reviews?page=${pageNo}&limit=${recordsLimit}`;
    setLoading(true);
    const apiResponse = await Post(
      url,
      {
        search,
      },
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
      title: 'Session ID',
      render: (item) => {
        return <p className={''}>{`${item?.session?.slug}`}</p>;
      },
      width: 150,
    },
    {
      title: 'Review',
      dataIndex: 'review',
      width: 350,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      width: 130,
    },

    {
      title: 'User',
      dataIndex: 'user',
      render: (item) => {
        return (
          <p
            className={'underline cursor-pointer text-[var(--blue-color)]'}
            onClick={() => {
              setSelectedItem(item);
              setShowModal('view');
            }}
          >
            {`${item?.firstName} ${item?.lastName}`}
          </p>
        );
      },
    },
  ];

  return (
    <SideBarSkeleton heading={'Reviews'}>
      <div className={classes?.mainContainer}>
        <>
          <div className={[classes?.headingContainer, 'mb-5'].join(' ')}>
            <Input
              type={'text'}
              placeholder={`Search user name or email or session ID`}
              value={search}
              setter={setSearch}
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
          setShowModal(false);
          setSelectedItem(null);
        }}
        data={selectedItem}
      />
      <ViewPDFModal
        show={showModal == 'view-pdf'}
        setShow={() => {
          setShowModal(false);
          setSelectedItem(null);
        }}
        data={selectedItem}
      />
    </SideBarSkeleton>
  );
};

export default Reviews;
