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

  // Fallback plans in case API doesn't work
  const fallbackPlans = [
    {
      _id: 'basic',
      planId: 'basic',
      name: 'Basic Plan',
      displayName: 'Basic Plan',
      price: 9.99,
      description: [
        '5 AI Sessions per month',
        'Basic AI models access',
        'Email support',
        'Standard response time'
      ]
    },
    {
      _id: 'plus',
      planId: 'plus',
      name: 'Plus Plan',
      displayName: 'Plus Plan',
      price: 19.99,
      description: [
        '20 AI Sessions per month',
        'Advanced AI models access',
        'Priority email support',
        'Faster response time',
        'API access'
      ]
    },
    {
      _id: 'premium',
      planId: 'premium',
      name: 'Premium Plan',
      displayName: 'Premium Plan',
      price: 39.99,
      description: [
        'Unlimited AI Sessions',
        'Premium AI models access',
        '24/7 phone support',
        'Fastest response time',
        'Full API access'
      ]
    }
  ];

  const getPlans = async () => {
    setLoading(true);
    try {
      const response = await Get(BaseURL('subscriptions/plans'));
      setLoading(false);
      const plansData = response?.data?.plans || response?.data?.data?.plans || response?.data?.data;
      if (Array.isArray(plansData) && plansData.length > 0) {
        setPlans(plansData);
      } else {
        setPlans(fallbackPlans);
      }
    } catch (error) {
      setLoading(false);
      setPlans(fallbackPlans);
    }
  };

  useEffect(() => {
    getPlans();
  }, []);

  const selectPlan = async (planName) => {
    if (!accessToken) {
      CustomToast({ message: 'Please login to subscribe to a plan', type: 'error' });
      return;
    }

    try {
      const actualPlanName = planName === 'Basic Plan' ? 'basic' : planName;
      const subscriptionData = {
        planName: actualPlanName,
        billingCycle: 'monthly',
        paymentMethod: 'credit_card',
        paymentDetails: { token: 'tok_visa' },
      };

      const response = await Post(
        BaseURL('subscriptions/subscribe'),
        subscriptionData,
        apiHeader(accessToken)
      );

      if (response?.data?.success) {
        CustomToast({ message: response?.data?.message || 'Subscription created successfully!', type: 'success' });
        if (response?.data?.data?.subscription) {
          const updatedUser = { ...user, subscription: response?.data?.data?.subscription };
          dispatch(updateUser(updatedUser));
        }
        await getPlans();
        router.push('/my-subscription');
        return;
      }

      CustomToast({ message: response?.data?.message || 'Failed to subscribe. Please try again.', type: 'error' });
    } catch (apiError) {
      if (apiError?.response?.status === 404) {
        CustomToast({
          message: 'Subscription endpoint not implemented yet. Please contact support.',
          type: 'warning',
        });
        return;
      }
      CustomToast({ message: apiError?.response?.data?.message || 'Failed to subscribe. Please try again.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Choose Your Plan</h1>
          <p className="text-lg text-gray-600">Select the perfect plan for your AI learning journey</p>
        </div>
        {/* Plans Grid */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)] mx-auto mb-4"></div>
              <p className="text-gray-600 text-base">Loading plans...</p>
            </div>
          </div>
        ) : (
          Array.isArray(plans) && plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
              {plans.map((a, i) => (
                <div key={i} className="w-full">
                  <PlanCard
                    data={a}
                    onPurchase={() => selectPlan(a?.name || a?._id)}
                    selected={(user?.subscription?.plan === a?.name) || (user?.subscription?.plan === a?._id) || (user?.subscription?.plan === a?.displayName)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="text-center">
                <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600 text-base">No plans available</p>
                <p className="text-gray-500 text-sm mt-2">Please check back later or contact support</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
