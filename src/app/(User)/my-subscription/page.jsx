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
        const apiData = response?.data?.data;
        // Normalize API -> UI shape
        const featuresObj = apiData?.planDetails?.features || {};
        const featuresList = [
          typeof featuresObj.maxCourses === 'number' && `Max Courses: ${featuresObj.maxCourses}`,
          featuresObj.aiTutor && 'AI Tutor',
          featuresObj.transcriptDownload && 'Transcript Download',
          featuresObj.feedbackReport && 'Feedback Report',
          featuresObj.evaluationReport && 'Evaluation Report',
          typeof featuresObj.onlineConsultingSessions === 'number' && `Online Consulting Sessions: ${featuresObj.onlineConsultingSessions}`,
        ].filter(Boolean);

        const normalized = {
          plan:
            apiData?.subscription?.plan ||
            apiData?.planDetails?.displayName ||
            apiData?.planDetails?.name || 'none',
          status: apiData?.subscription?.status || 'inactive',
          trialEndDate: apiData?.subscription?.trialEndDate || null,
          startDate: apiData?.subscription?.startDate || null,
          endDate: apiData?.subscription?.endDate || null,
          nextBillingDate: apiData?.subscription?.nextBillingDate || apiData?.subscription?.endDate || null,
          autoRenew: Boolean(apiData?.subscription?.autoRenew),
          features: featuresList,
          price: apiData?.planDetails?.price || null,
          currency: apiData?.planDetails?.price?.currency || 'USD',
        };

        setSubscription(normalized);
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
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-slate-700 text-xl">Loading subscription details...</div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">No Active Subscription</h1>
            <p className="text-slate-600 mb-8">You don't have an active subscription. Choose a plan to get started.</p>
            <button
              onClick={() => router.push('/plans')}
              className="bg-[var(--primary-color)] hover:opacity-90 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              View Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
          {/* Decorative wave */}
          <svg className="absolute inset-x-0 -bottom-8 w-full h-28 opacity-20" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="#ffffff" d="M0,288L48,250.7C96,213,192,139,288,138.7C384,139,480,213,576,234.7C672,256,768,224,864,224C960,224,1056,256,1152,256C1248,256,1344,224,1392,208L1440,192L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
          </svg>
          <div
            className="px-6 py-7 text-white relative"
            style={{ background: 'linear-gradient(90deg, #2b63cc 0%, #023789 100%)' }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-white/15 border border-white/25 backdrop-blur-[1px]">
                    {subscription.plan || 'Plan'}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${subscription.status === 'active' ? 'bg-emerald-500' : subscription.status === 'trial' ? 'bg-blue-500' : subscription.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500'} text-white`}>
                    {subscription.status}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${subscription.autoRenew ? 'bg-white/20 text-white' : 'bg-white text-[var(--primary-color)]'}`}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: subscription.autoRenew ? '#34d399' : '#f59e0b' }} />
                    {subscription.autoRenew ? 'Auto-Renew On' : 'Auto-Renew Off'}
                  </span>
                </div>
                <h2 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight">Your Subscription</h2>
                <p className="text-white/90 text-sm mt-1">Manage your plan, billing and renewal settings</p>
              </div>

              <div className="text-right">
                <div className="inline-flex items-end gap-1 px-5 py-2 rounded-xl bg-white/10 border border-white/20 backdrop-blur-[1px] shadow">
                  <span className="text-3xl font-extrabold">{subscription.price?.monthly ? `$${subscription.price.monthly}` : ''}</span>
                  {subscription.price?.monthly && <span className="text-sm font-medium opacity-90">/month</span>}
                </div>
                {subscription.trialEndDate && (
                  <div className="mt-2 text-xs opacity-90">Trial ends {formatDate(subscription.trialEndDate)}</div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Toolbar */}
          <div className="bg-white/70 backdrop-blur-xl border-t border-slate-200 px-4 py-3 flex flex-wrap gap-3 justify-between">
            <div className="flex gap-3">
              <button onClick={() => router.push('/plans')} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h7" /></svg>
                Change Plan
              </button>
              <button onClick={() => router.push('/payment-history')} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Billing
              </button>
            </div>
            {subscription.status === 'active' ? (
              <button onClick={cancelSubscription} disabled={actionLoading} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white bg-red-500 hover:bg-red-600 disabled:opacity-50 shadow-sm">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 8.586L4.293 2.879 2.879 4.293 8.586 10l-5.707 5.707 1.414 1.414L10 11.414l5.707 5.707 1.414-1.414L11.414 10l5.707-5.707-1.414-1.414L10 8.586z" clipRule="evenodd" /></svg>
                {actionLoading ? 'Cancelling...' : 'Cancel'}
              </button>
            ) : (
              <button onClick={renewSubscription} disabled={actionLoading} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m-4-4h8" /></svg>
                {actionLoading ? 'Renewing...' : 'Renew'}
              </button>
            )}
          </div>
        </div>

        {/* Info tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl p-[1px] bg-gradient-to-br from-[#7aa7ff] via-[#6ee7b7] to-[#a78bfa] shadow-sm">
            <div className="bg-white rounded-2xl p-4 h-full">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg,#2b63cc,#023789)' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3M3 11h18M5 19h14a2 2 0 002-2v-6H3v6a2 2 0 002 2z"/></svg>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Start Date</p>
                  <p className="text-slate-900 font-semibold">{subscription.startDate ? formatDate(subscription.startDate) : '-'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-[1px] bg-gradient-to-br from-[#7aa7ff] via-[#6ee7b7] to-[#a78bfa] shadow-sm">
            <div className="bg-white rounded-2xl p-4 h-full">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3"/></svg>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Next Billing</p>
                  <p className="text-slate-900 font-semibold">{subscription.nextBillingDate ? formatDate(subscription.nextBillingDate) : '-'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-[1px] bg-gradient-to-br from-[#7aa7ff] via-[#6ee7b7] to-[#a78bfa] shadow-sm">
            <div className="bg-white rounded-2xl p-4 h-full">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                  style={{ background: subscription.status==='active' ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#f59e0b,#ef4444)'}}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4"/></svg>
                </div>
                <div>
                  <p className="text-slate-500 text-sm">Status</p>
                  <p className={`font-semibold ${subscription.status === 'active' ? 'text-emerald-600' : subscription.status === 'cancelled' ? 'text-red-600' : 'text-amber-600'}`}>{subscription.status}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Features Panel (chips) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Features</h3>
            {Array.isArray(subscription.features) && subscription.features.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {subscription.features.map((feature, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full text-sm bg-gradient-to-r from-slate-100 to-white border border-slate-200">
                    {feature}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-600">No feature details available.</p>
            )}
          </div>

          {/* Billing Summary */}
          <div className="rounded-2xl p-[1px] bg-gradient-to-br from-[#7aa7ff] via-[#6ee7b7] to-[#a78bfa] shadow-sm">
            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Billing Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Plan</span>
                  <span className="text-slate-900 font-semibold capitalize">{subscription.plan}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">End Date</span>
                  <span className="text-slate-900">{subscription.endDate ? formatDate(subscription.endDate) : '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Auto-Renew</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${subscription.autoRenew ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {subscription.autoRenew ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
              <div className="mt-5 text-sm text-slate-500">
                Need to change billing details? Visit Payment History.
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Subscription Timeline</h3>
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mt-1 mr-4"></div>
              <div>
                <p className="text-slate-900 font-semibold">Subscription Started</p>
                <p className="text-slate-600 text-sm">{formatDate(subscription.startDate)}</p>
              </div>
            </div>
            {subscription.nextBillingDate && (
              <div className="flex items-start">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 mr-4"></div>
                <div>
                  <p className="text-slate-900 font-semibold">Next Billing Date</p>
                  <p className="text-slate-600 text-sm">{formatDate(subscription.nextBillingDate)}</p>
                </div>
              </div>
            )}
            {subscription.status === 'cancelled' && subscription.cancelledAt && (
              <div className="flex items-start">
                <div className="w-3 h-3 bg-red-500 rounded-full mt-1 mr-4"></div>
                <div>
                  <p className="text-slate-900 font-semibold">Subscription Cancelled</p>
                  <p className="text-slate-600 text-sm">{formatDate(subscription.cancelledAt)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
