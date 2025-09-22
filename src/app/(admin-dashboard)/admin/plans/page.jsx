'use client';
import { Get, Patch } from '@/Axios/AxiosFunctions';
import IconBtn from '@/components/IconBtn';
import SideBarSkeleton from '@/components/SideBarSkeleton';
import TableComponent from '@/components/TableComponent';
import { apiHeader, BaseURL } from '@/config/apiUrl';
import AddOrEditPackageModal from '@/modals/AddOrEditPackageModal';
import ViewPackageModal from '@/modals/ViewPackageModal';
import { useEffect, useState } from 'react';
import { AiFillEye } from 'react-icons/ai';
import { MdModeEdit } from 'react-icons/md';
import { useSelector } from 'react-redux';

export default function Packages() {
  const accessToken = useSelector((state) => state.authReducer.accessToken);
  const [showModal, setShowModal] = useState(null);
  const [responseData, setResponseData] = useState([]);
  const [loading, setLoading] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const apiUrl = BaseURL('admin/plan');

  useEffect(() => {
    getAllData();
  }, []);

  const getAllData = async () => {
    const url = `${apiUrl}/get-all-plans`;
    setLoading('get');
    const apiResponse = await Get(url, accessToken);
    setLoading('');

    if (apiResponse !== undefined) {
      setResponseData(apiResponse?.data?.data);
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
            <IconBtn
              icon={<MdModeEdit />}
              onClick={() => {
                setSelectedItem(record);
                setShowModal('edit');
              }}
              title='Edit'
            />
          </div>
        );
      },
    },
  ];

  const handleUpdatePackage = async (e) => {
    const url = `${apiUrl}/update-plan/${selectedItem?._id}`;
    setLoading('edit');
    const apiResponse = await Patch(url, e, apiHeader(accessToken));
    setLoading('');
    if (apiResponse !== undefined) {
      const newData = [...responseData];
      newData.splice(
        newData?.findIndex((item) => item?._id === selectedItem?._id),
        1,
        apiResponse?.data?.data
      );
      setResponseData(newData);
      setSelectedItem(apiResponse?.data?.data);
    }
  };

  return (
    <SideBarSkeleton heading={'Plans'}>
      <div className='px-[40px] mt-[40px]'>
        <>
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
        key={selectedItem?._id}
        onClick={handleUpdatePackage}
        loading={loading == 'edit'}
        data={selectedItem}
      />
    </SideBarSkeleton>
  );
}
