'use client';
import { Get, Post } from '@/Axios/AxiosFunctions';
import PlanCard from '@/components/PlanCard';
import { apiHeader, BaseURL } from '@/config/apiUrl';
import { CustomToast } from '@/CustomToast';
import { updateUser } from '@/store/auth/authSlice';
import { Col, Row } from 'antd';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function Plans() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, accessToken } = useSelector((state) => state?.authReducer);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  const getPlans = async () => {
    setLoading(true);
    const response = await Get(BaseURL('plans/get-plans'));
    setLoading(false);
    if (response) {
      setPlans(response?.data?.data);
    }
  };

  useEffect(() => {
    getPlans();
  }, []);

  const selectPlan = async (id) => {
    const response = await Post(
      BaseURL(`auth/select-plan`),
      { planId: id },
      apiHeader(accessToken)
    );
    if (response) {
      CustomToast({ message: 'Plan purchased successfully', type: 'success' });
      dispatch(updateUser(response?.data?.data?.user));
      router.push('/dashboard');
    }
  };

  return (
    <Row className='' gutter={[16, 16]}>
      <Col xs={24}>
        <h5 className='font-semibold dark:text-white'>Plans </h5>
      </Col>
      {loading ? (
        <Col xs={24}>
          <div className='min-h-[300px] flex justify-center items-center'>
            <p className='dark:text-white'>Loading...</p>
          </div>
        </Col>
      ) : (
        plans?.map((a, i) => (
          <Col md={8} sm={12} xs={24} key={i}>
            <PlanCard
              key={i}
              data={a}
              onPurchase={() => selectPlan(a?._id)}
              selected={user?.plan?._id == a?._id}
            />
          </Col>
        ))
      )}
    </Row>
  );
}
