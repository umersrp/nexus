'use client';
import { Delete, Get } from '@/Axios/AxiosFunctions';
import { BaseURL, recordsLimit } from '@/config/apiUrl';
import Button from '@/components/Button';
import TableComponent from '@/components/TableComponent';
import axios from 'axios';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import classes from './sessions.module.css';

const Users = () => {
  const { isSessionOpen } = useSelector((state) => state?.commonReducer);
  const router = useRouter();
  const accessToken = useSelector((state) => state.authReducer.accessToken);
  const [responseData, setResponseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [areYouSureModalOpen, setAreYouSureModalOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const apiUrl = BaseURL('session');

  useEffect(() => {
    setPage(1);
    getAllData(1);
  }, []);

  const getAllData = async (pageNo) => {
    const url = `${apiUrl}/get-my-sessions?page=${pageNo}&limit=${recordsLimit}`;
    setLoading(true);
    const apiResponse = await Get(url, accessToken);
    setLoading(false);

    if (apiResponse !== undefined) {
      setResponseData(apiResponse?.data?.data);
      setTotalPages(apiResponse?.data?.totalPages);
    }
  };

  const downloadPDF = async (id) => {
    setSubmitLoading(id);
    const response = await axios.post(
      BaseURL(`session/generate-feedback`),
      { sessionId: id },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
        responseType: 'blob',
      }
    );

    // Create a URL for the Blob
    const url = URL.createObjectURL(
      new Blob([response?.data], { type: 'application/pdf' })
    );

    const link = document.createElement('a');
    link.href = url;
    link.download = 'feedback.pdf';
    link.click();
    setSubmitLoading('');
  };
  const columns = [
    {
      title: 'No',
      dataIndex: 'slug',
      render: (__, _, index) => {
        return <p>{`${(page - 1) * recordsLimit + index + 1}`}</p>;
      },
      width: 80,
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      render: (item) => {
        return <p>{`${item} Mins`}</p>;
      },
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      render: (item) => {
        return <p>{`${moment(item).format('DD-MM-YYYY hh:mm:ss a')}`}</p>;
      },
    },
    {
      title: 'Actions',
      dataIndex: '',
      render: (item) => {
        return (
          <Button
            onClick={() => downloadPDF(item?._id)}
            disabled={submitLoading == item?._id}
          >
            {submitLoading == item?._id
              ? 'Downloading...'
              : `Download Transcript`}
          </Button>
        );
      },
    },
  ];
  return (
    <div>
      <div className={classes?.mainContainer}>
        <>
          <div className={[classes?.headingContainer, 'mb-5'].join(' ')}>
            <h5 className='dark:text-white'>My Sessions</h5>
            <Button onClick={() => router.push('/dashboard')}>
              {isSessionOpen ? 'View Session' : `Create Session`}
            </Button>
          </div>
          <TableComponent
            columns={columns}
            data={responseData}
            totalPages={totalPages}
            isLoading={loading}
            page={page}
            onPageChange={(e) => {
              setPage(e?.current);
              getAllData(e?.current);
            }}
          />
        </>
      </div>
    </div>
  );
};

export default Users;
