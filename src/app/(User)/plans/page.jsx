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
  
  // Debug user profile status
  console.log('User profile status:', {
    isProfileComplete: user?.isProfileComplete,
    user: user
  });
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
      console.log('Fetching plans from:', BaseURL('subscriptions/plans'));
      const response = await Get(BaseURL('subscriptions/plans'));
      console.log('Full response:', response);
      setLoading(false);
      
      if (response) {
        console.log('Plans response data:', response?.data);
        console.log('Plans response data.data:', response?.data?.data);
        
        // Handle multiple possible response structures
        const plansData = response?.data?.plans || response?.data?.data?.plans || response?.data?.data;
        console.log('Extracted plans data:', plansData);
        console.log('Is array?', Array.isArray(plansData));
        
        if (Array.isArray(plansData) && plansData.length > 0) {
          setPlans(plansData);
          console.log('Plans set successfully:', plansData.length, 'plans');
          console.log('Plan names available:', plansData.map(p => ({
            _id: p._id,
            planId: p.planId,
            name: p.name,
            displayName: p.displayName
          })));
        } else {
          console.error('Plans data is not an array or empty:', plansData);
          console.log('Using fallback plans');
          setPlans(fallbackPlans);
        }
      } else {
        console.log('No response received, using fallback plans');
        setPlans(fallbackPlans);
      }
    } catch (error) {
      setLoading(false);
      console.error('Error fetching plans:', error);
      console.log('Using fallback plans due to error');
      setPlans(fallbackPlans);
    }
  };

  useEffect(() => {
    getPlans();
    // Refresh user data to ensure profile status is up to date
    refreshUserData();
  }, []);

  const refreshUserData = async () => {
    try {
      // You can add an API call here to refresh user data if needed
      // For now, we'll just log the current user state
      console.log('Current user state:', user);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const testEndpoints = async () => {
    const testEndpoints = [
      'subscriptions/subscribe',
      'subscriptions/purchase',
      'subscriptions/activate',
      'plans/subscribe',
      'plans/purchase'
    ];
    
    console.log('Testing available endpoints...');
    for (const endpoint of testEndpoints) {
      try {
        const response = await Get(BaseURL(endpoint));
        console.log(`✅ ${endpoint} - Available`, response?.status);
      } catch (error) {
        console.log(`❌ ${endpoint} - ${error?.response?.status || 'Error'}`, error?.response?.statusText);
      }
    }
  };

  const selectPlan = async (planName) => {
    if (!accessToken) {
      CustomToast({ message: 'Please login to subscribe to a plan', type: 'error' });
      return;
    }

    console.log('Selected plan name:', planName);
    console.log('Available plans:', plans);
    console.log('Plan data structure:', plans.map(p => ({
      _id: p._id,
      name: p.name,
      displayName: p.displayName,
      allKeys: Object.keys(p)
    })));

    try {
      // Ensure we're using the correct plan name
      const actualPlanName = planName === 'Basic Plan' ? 'basic' : planName;
      console.log('Original planName:', planName);
      console.log('Corrected planName:', actualPlanName);
      
      const subscriptionData = {
        planName: actualPlanName,
        billingCycle: 'monthly', // Default to monthly
        paymentMethod: 'credit_card',
        paymentDetails: {
          token: 'tok_visa' // This would be replaced with actual payment token
        }
      };

      console.log('Subscribing to plan:', subscriptionData);
      console.log('API URL:', BaseURL('subscriptions/subscribe'));
      console.log('Headers:', apiHeader(accessToken));
      
      try {
        // Try the real API endpoint first
        const response = await Post(
          BaseURL('subscriptions/subscribe'),
          subscriptionData,
          apiHeader(accessToken)
        );
        
        console.log('Subscription API Response:', response);
        
        if (response?.data?.success) {
          CustomToast({ 
            message: response?.data?.message || '✅ Subscription created successfully!', 
            type: 'success' 
          });
          
          // Update user data with new subscription info
          if (response?.data?.data?.subscription) {
            // Update user's subscription info in Redux store
            const updatedUser = {
              ...user,
              subscription: response?.data?.data?.subscription
            };
            dispatch(updateUser(updatedUser));
            console.log('✅ User subscription updated in Redux:', updatedUser.subscription);
          }
          
          // Refresh plans to show updated selection
          await getPlans();
          
          // Force refresh user data from localStorage/API
          setTimeout(() => {
            window.location.reload();
          }, 2000);
          return;
        } else {
          throw new Error(response?.data?.message || 'Subscription failed');
        }
      } catch (apiError) {
        console.log('API Error:', apiError?.response?.status, apiError?.response?.data);
        
        // If API endpoint doesn't exist (404), show helpful message
        if (apiError?.response?.status === 404) {
          CustomToast({
            message: '⚠️ Subscription endpoint not implemented on backend yet. Please contact backend team to implement /subscriptions/subscribe endpoint.',
            type: 'warning',
          });
          return;
        }
        
        // For other errors, show the actual error message
        CustomToast({
          message: apiError?.response?.data?.message || 'Failed to subscribe. Please try again.',
          type: 'error',
        });
        return;
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      CustomToast({
        message: 'An unexpected error occurred. Please try again.',
        type: 'error',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Select the perfect plan for your AI learning journey
          </p>
          
          {/* Debug User State */}
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6 max-w-4xl mx-auto">
            <div className="text-sm">
              <strong>Debug Info:</strong><br/>
              User Plan: <code>{user?.subscription?.plan || 'none'}</code><br/>
              Subscription Status: <code>{user?.subscription?.status || 'none'}</code><br/>
              Full Subscription: <code>{JSON.stringify(user?.subscription, null, 2)}</code>
            </div>
          </div>
          
        </div>
        {/* Plans Grid */}
        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--primary-color)] mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300 text-lg">Loading plans...</p>
            </div>
          </div>
        ) : (
          Array.isArray(plans) && plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
              {plans.map((a, i) => (
                <div key={i} className="w-full">
                  <PlanCard
                    data={a}
                    onPurchase={() => {
                      console.log('PlanCard onPurchase - plan data:', a);
                      console.log('PlanCard onPurchase - a.name:', a?.name);
                      console.log('PlanCard onPurchase - a._id:', a?._id);
                      console.log('PlanCard onPurchase - a.displayName:', a?.displayName);
                      selectPlan(a?.name || a?._id);
                    }}
                    selected={(() => {
                      const userPlan = user?.subscription?.plan;
                      const planName = a?.name;
                      const planId = a?._id;
                      const planDisplayName = a?.displayName;
                      
                      // Check multiple conditions for plan matching
                      const isSelected = (
                        userPlan === planName || 
                        userPlan === planId || 
                        userPlan === planDisplayName ||
                        (userPlan === 'basic' && planName === 'basic') ||
                        (userPlan === 'Basic Plan' && planDisplayName === 'Basic Plan') ||
                        (user?.subscription?.status === 'active' && userPlan === planName)
                      );
                      
                      console.log('🔍 Plan Matching Debug:', {
                        userPlan,
                        planName,
                        planId,
                        planDisplayName,
                        isSelected,
                        userSubscription: user?.subscription
                      });
                      
                      return isSelected;
                    })()}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600 dark:text-gray-300 text-lg">No plans available</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Please check back later or contact support</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
