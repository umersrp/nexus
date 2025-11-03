'use client';
import { Get, Post } from '@/Axios/AxiosFunctions';
import IconBtn from '@/components/IconBtn';
import TableComponent from '@/components/TableComponent';
import { apiHeader, BaseURL } from '@/config/apiUrl';
import ViewPackageModal from '@/modals/ViewPackageModal';
import AddOrEditPackageModal from '@/modals/AddOrEditPackageModal';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { decryptToken } from '@/config/helper';
import { AiFillEye } from 'react-icons/ai';
import { useSelector } from 'react-redux';

export default function Packages() {
  const accessToken = useSelector((state) => state.authReducer.accessToken);
  const [showModal, setShowModal] = useState(null);
  const [responseData, setResponseData] = useState([]);
  const [loading, setLoading] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const getAuthToken = () => {
    if (typeof window === 'undefined') return undefined;
    const enc = Cookies.get('xpdx');
    const raw = Cookies.get('token');
    const ls = localStorage.getItem('token');
    const dec = enc ? decryptToken(enc) : null;
    return dec || raw || accessToken || ls || undefined;
  };

  useEffect(() => {
    getAllData();
  }, []);

  const getAllData = async () => {
    const paramsTs = `_ts=${Date.now()}`;
    const url = BaseURL(`subscriptions/plans?${paramsTs}`);
    const token = getAuthToken();
    setLoading('get');
    const apiResponse = await Get(url, token);
    setLoading('');

    if (apiResponse !== undefined) {
      const items = apiResponse?.data?.data?.plans || apiResponse?.data?.plans || apiResponse?.data?.data || [];
      setResponseData(Array.isArray(items) ? items : []);
    }
  };
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      render: (text, record) => {
        return <>€{`${record?.price}`}</>;
      },
    },

    {
      title: 'Session Duration',
      dataIndex: 'duration',
      render: (text, record) => {
        return <>{`${text}`}Mins</>;
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

  const handleUpdatePackage = async (payload) => {
    try {
      setLoading('edit');
      // Create plan via admin route
      const urlCreate = BaseURL('subscriptions/create/plan');
      const token = getAuthToken();
      const headers = apiHeader(token);
      const apiResponse = await Post(urlCreate, payload, headers);
      if (apiResponse !== undefined) {
        await getAllData();
        setShowModal(null);
      }
    } finally {
      setLoading('');
    }
  };

  return (
      <div className='px-[40px] mt-[40px]'>
        <>
          <div className='flex justify-end mb-4'>
            <button
              onClick={() => { setSelectedItem(null); setShowModal('edit'); }}
              className='px-4 py-2 rounded-md text-white'
              style={{ background: '#1E3A8A' }}
            >
              Create Plan
            </button>
          </div>
          <TableComponent
            columns={columns}
            data={responseData}
            isLoading={loading == 'get'}
            pagination={false}
          />
        </>
      </div>

      <ViewPackageModal
        show={showModal == 'view'}
        onClose={() => {
          setShowModal(false);
          setSelectedItem(null);
        }}
        data={selectedItem}
      />
      <AddOrEditPackageModal
        show={showModal == 'edit'}
        onClose={() => {
          setShowModal(false);
          setSelectedItem(null);
        }}
        key={selectedItem?._id || 'create'}
        onClick={handleUpdatePackage}
        loading={loading == 'edit'}
        data={selectedItem}
      />
    </>
  );
}
