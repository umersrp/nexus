'use client';
import { Post } from '@/Axios/AxiosFunctions';
import Input from '@/components/Input';
import SideBarSkeleton from '@/components/SideBarSkeleton';
import { apiHeader, BaseURL, recordsLimit } from '@/config/apiUrl';
import useDebounce from '@/custom-hooks/useDebounce';
import Button from '@/components/Button';
import SessionSettingsModal from '@/modals/SessionSettingsModal';
import TableComponent from '@/components/TableComponent';
import ViewUserModal from '@/modals/ViewUserModal';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import classes from './sessions.module.css';

import axios from 'axios';
import moment from 'moment';
import ViewPDFModal from '../../../../modals/ViewPDFModal';

const Sessions = () => {
  const accessToken = useSelector((state) => state.authReducer.accessToken);
  const [responseData, setResponseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const debounceSearch = useDebounce(search, 500);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sessionSettings, setSessionSettings] = useState({ duration: 30, allowPauseResume: true, allowStop: true });

  const apiUrl = BaseURL('admin/sessions');

  useEffect(() => {
    setPage(1);
    getAllData(1);
  }, [debounceSearch]);

  const getAllData = async (pageNo) => {
    const url = `${apiUrl}/get-all-sessions?page=${pageNo}&limit=${recordsLimit}`;
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

  const downloadPDF = async (id) => {
    setSubmitLoading(id);
    const response = await axios.post(
      `${apiUrl}/session/generate-feedback`,
      { sessionId: id },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
        responseType: 'blob',
      }
    );
    setSubmitLoading('');
    if (response?.data) {
      // Create a URL for the Blob
      const url = URL.createObjectURL(
        new Blob([response?.data], { type: 'application/pdf' })
      );

      const link = document.createElement('a');
      link.href = url;
      setSelectedItem(url);
      setShowModal('view-pdf');
    }
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
      width: 100,
      render: (item) => {
        return <p>{`${item} Mins`}</p>;
      },
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      width: 130,
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      render: (item) => {
        return <p>{`${moment(item).format('DD-MM-YYYY hh:mm:ss a')}`}</p>;
      },
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
    {
      title: 'Actions',
      dataIndex: '',
      width: 220,
      render: (item) => {
        return (
          <Button
            onClick={() => {
              downloadPDF(item?._id);
            }}
            disabled={submitLoading == item?._id}
          >
            {submitLoading == item?._id ? 'Downloading...' : `Transcript`}
          </Button>
        );
      },
    },
  ];
  return (
    <SideBarSkeleton heading={'Sessions'}>
      <div className={classes?.mainContainer}>
        <>
          <div className={[classes?.headingContainer, 'mb-5'].join(' ')}>
            <Input
              type={'text'}
              placeholder={`Search user name or email or ID`}
              value={search}
              setter={setSearch}
              inputContainerClass={classes.inputPlain}
            />
            <Button onClick={() => setSettingsOpen(true)} className={classes.settingsBtn}>
              Session Settings
            </Button>
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
      <SessionSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        initial={sessionSettings}
        onSave={(val) => {
          setSessionSettings(val);
          setSettingsOpen(false);
        }}
      />
    </SideBarSkeleton>
  );
};

export default Sessions;
