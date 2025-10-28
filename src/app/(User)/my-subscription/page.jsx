'use client';
import { Get, Post } from '@/Axios/AxiosFunctions';
import { apiHeader, BaseURL } from '@/config/apiUrl';
import { CustomToast } from '@/CustomToast';
import { updateUser } from '@/store/auth/authSlice';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export default function MySubscription() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, accessToken } = useSelector((state) => state?.authReducer);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const getMySubscription = async () => {
    setLoading(true);
    try {
      const response = await Get(
        BaseURL('subscriptions/my-subscription'),
        accessToken
      );
      if (response) {
        console.log('Subscription response:', response);
        setSubscription(response?.data?.data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      CustomToast({
        message: 'Failed to load subscription details',
        type: 'error',
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    getMySubscription();
  }, []);

  const cancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;
    
    setActionLoading(true);
    try {
      const response = await Post(
        BaseURL('subscriptions/cancel'),
        {},
        apiHeader(accessToken)
      );
      if (response) {
        CustomToast({ message: 'Subscription cancelled successfully', type: 'success' });
        getMySubscription();
      }
    } catch (error) {
      console.error('Cancel subscription error:', error);
      CustomToast({
        message: error?.response?.data?.message || 'Failed to cancel subscription',
        type: 'error',
      });
    }
    setActionLoading(false);
  };

  const renewSubscription = async () => {
    setActionLoading(true);
    try {
      const response = await Post(
        BaseURL('subscriptions/renew'),
        {
          paymentMethod: 'credit_card',
          paymentDetails: {
            token: 'tok_visa' // This would be replaced with actual payment token
          }
        },
        apiHeader(accessToken)
      );
      if (response) {
        CustomToast({ message: 'Subscription renewed successfully', type: 'success' });
        getMySubscription();
      }
    } catch (error) {
      console.error('Renew subscription error:', error);
      CustomToast({
        message: error?.response?.data?.message || 'Failed to renew subscription',
        type: 'error',
      });
    }
    setActionLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--page-bg-color)] p-6 flex items-center justify-center">
        <div className="text-white text-xl">Loading subscription details...</div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-[var(--page-bg-color)] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">No Active Subscription</h1>
            <p className="text-white/80 mb-8">You don't have an active subscription. Choose a plan to get started.</p>
            <button
              onClick={() => router.push('/plans')}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              View Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--page-bg-color)] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Subscription</h1>
          <p className="text-white/80">Manage your subscription and billing</p>
        </div>

        {/* Subscription Overview */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Current Plan</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/80">Plan:</span>
                  <span className="text-white font-semibold capitalize">{subscription.plan || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Status:</span>
                  <span className={`font-semibold ${
                    subscription.status === 'active' ? 'text-green-400' : 
                    subscription.status === 'cancelled' ? 'text-red-400' : 
                    subscription.status === 'trial' ? 'text-blue-400' :
                    'text-yellow-400'
                  }`}>
                    {subscription.status}
                  </span>
                </div>
                {subscription.trialEndDate && (
                  <div className="flex justify-between">
                    <span className="text-white/80">Trial Ends:</span>
                    <span className="text-white font-semibold">{formatDate(subscription.trialEndDate)}</span>
                  </div>
                )}
                {subscription.startDate && (
                  <div className="flex justify-between">
                    <span className="text-white/80">Start Date:</span>
                    <span className="text-white font-semibold">{formatDate(subscription.startDate)}</span>
                  </div>
                )}
                {subscription.endDate && (
                  <div className="flex justify-between">
                    <span className="text-white/80">End Date:</span>
                    <span className="text-white font-semibold">{formatDate(subscription.endDate)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-white/80">Auto Renew:</span>
                  <span className="text-white font-semibold">{subscription.autoRenew ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Plan Features</h3>
              <ul className="space-y-2">
                {subscription.features?.map((feature, index) => (
                  <li key={index} className="flex items-center text-white/90">
                    <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => router.push('/payment-history')}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Payment History
          </button>

          {subscription.status === 'active' ? (
            <button
              onClick={cancelSubscription}
              disabled={actionLoading}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {actionLoading ? 'Cancelling...' : 'Cancel Subscription'}
            </button>
          ) : (
            <button
              onClick={renewSubscription}
              disabled={actionLoading}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
            >
              {actionLoading ? 'Renewing...' : 'Renew Subscription'}
            </button>
          )}

          <button
            onClick={() => router.push('/plans')}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Change Plan
          </button>
        </div>

        {/* Subscription Timeline */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4">Subscription Timeline</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-4"></div>
              <div>
                <p className="text-white font-semibold">Subscription Started</p>
                <p className="text-white/60 text-sm">{formatDate(subscription.startDate)}</p>
              </div>
            </div>
            {subscription.nextBillingDate && (
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-400 rounded-full mr-4"></div>
                <div>
                  <p className="text-white font-semibold">Next Billing Date</p>
                  <p className="text-white/60 text-sm">{formatDate(subscription.nextBillingDate)}</p>
                </div>
              </div>
            )}
            {subscription.status === 'cancelled' && subscription.cancelledAt && (
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-400 rounded-full mr-4"></div>
                <div>
                  <p className="text-white font-semibold">Subscription Cancelled</p>
                  <p className="text-white/60 text-sm">{formatDate(subscription.cancelledAt)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
