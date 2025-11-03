'use client';

import { Get, Patch, Post } from '@/Axios/AxiosFunctions';
import Button from '@/components/Button';
import MainLayout from '@/components/MainLayout';
import PlanCard from '@/components/PlanCard';
import { apiHeader, BaseURL, sessionDuration } from '@/config/apiUrl';
import { addBufferInRedux } from '@/helpers/arrayBuffer';
import { generateSpeech } from '@/helpers/speechToText';
import { updateUser } from '@/store/auth/authSlice';
import {
  setIsOpenSidebar,
  setIsSessionExpired,
  setIsSessionOpen,
  setLastInteractionTime,
  setSessionData,
  setSessionTime,
} from '@/store/commonReducer/commonSlice';
import { Col, Row, notification } from 'antd';
import moment from 'moment';
import { lazy, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPreferenceVoice } from '../../../config/helper';
import './dashboard.css';

const UserDashboard = lazy(() => import('@/components/UserDashboard'));

const ShowPlans = ({ onPurchase }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  const getPlans = async () => {
    setLoading(true);
    try {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const apiUrl = `${BaseURL('subscriptions/plans')}?_t=${timestamp}&_r=${randomId}&_cache=false`;
      
      const response = await Get(apiUrl);
      setLoading(false);
      
      if (response) {
        const plansData = response?.data?.plans || response?.data?.data?.plans || response?.data?.data;
        if (Array.isArray(plansData)) {
          setPlans(plansData);
        } else {
          setPlans([]);
        }
      }
    } catch (error) {
      setLoading(false);
      setPlans([]);
    }
  };

  useEffect(() => {
    getPlans();
  }, []);
  
  return (
    <Row className='mt-2' gutter={[16, 16]}>
      <Col xs={24}>
        <div className="flex justify-between items-center mb-4">
          <h5 className='font-semibold dark:text-white'>
            To start your session, Please select plan first
          </h5>
          <button 
            onClick={getPlans}
            className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-bold'
          >
            Force Refresh API
          </button>
        </div>
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
            <PlanCard data={a} onPurchase={() => onPurchase(a?.name || a?._id)} />
          </Col>
        ))
      )}
    </Row>
  );
};

function Home() {
  const socket = useRef(null);
  const dispatch = useDispatch();
  const { user, accessToken } = useSelector((state) => state?.authReducer);
  const { isSessionOpen, sessionData } = useSelector(
    (state) => state?.commonReducer
  );
  const [loading, setLoading] = useState(false);
  const [isAIResponse, setIsAIResponse] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const voiceMode = getPreferenceVoice(user?.preferences);

  const selectPlan = async (planName) => {
    try {
      const subscriptionData = {
        planName,
        billingCycle: 'monthly',
        paymentMethod: 'credit_card',
        paymentDetails: {
          token: 'tok_visa'
        }
      };

      const response = await Post(
        BaseURL('subscriptions/subscribe'),
        subscriptionData,
        apiHeader(accessToken)
      );
      
      if (response?.data?.success) {
        notification.success({
          message: 'Success',
          description: 'Plan subscribed successfully!',
        });
        
        if (response?.data?.data?.subscription) {
          const updatedUser = {
            ...user,
            subscription: response?.data?.data?.subscription
          };
          dispatch(updateUser(updatedUser));
        } else if (response?.data?.data?.user) {
          dispatch(updateUser(response?.data?.data?.user));
        }
        
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        notification.error({
          message: 'Error',
          description: response?.data?.message || 'Failed to subscribe',
        });
      }
    } catch (error) {
      notification.error({
        message: 'Error',
        description: error?.response?.data?.message || 'Failed to subscribe. Please try again.',
      });
    }
  };

  const getSessionLevels = async (sessionId) => {
    setIsAIResponse('pending');
    const response = await Post(
      BaseURL(`session/get-session-levels`),
      {
        sessionId,
      },
      apiHeader(accessToken)
    );
    if (response) {
      const audio = await generateSpeech(
        response?.data?.data?.aiResponse,
        voiceMode
      );
      addBufferInRedux(response?.data?.data?.aiResponse, audio);
      dispatch(setSessionData(response?.data?.data?.session));
    }
  };

  const startSesstion = async () => {
    setLoading('session');
    const response = await Post(
      BaseURL(`session/create-session`),
      {
        startTime: moment().format(`hh:mm:ss`),
        endTime: moment().add('minute', sessionDuration).format(`hh:mm:ss`),
        duration: sessionDuration,
      },
      apiHeader(accessToken)
    );

    if (response) {
      const audio = await generateSpeech(
        response?.data?.data?.greet,
        voiceMode
      );
      addBufferInRedux(response?.data?.data?.greet, audio);
      dispatch(setSessionData(response?.data?.data?.session));
      dispatch(setSessionTime(moment().format(`DD MMM YYYY hh:mm:ss a`)));
      dispatch(setIsOpenSidebar());
      dispatch(setIsSessionOpen(true));
      dispatch(setIsSessionExpired(false));
      
      notification.success({
        message: 'Success',
        description: 'Session started successfully',
      });
    }
    setLoading(false);
  };

  const addQueryInSession = async (query, time) => {
    dispatch(
      setLastInteractionTime({
        minutes: 0,
        seconds: 0,
      })
    );
    const extractTime = time?.split(':')[0] * 60 + +time?.split(':')[1];
    let modifyQuery =
      extractTime > 180
        ? query
        : extractTime < 60
        ? `"[word of appreciation based on session] work today! Our session is almost over, but I’m really impressed with your progress. Before we wrap up, here are a few suggestions to keep improving: [Provide brief tips based on user performance]. Don't forget to check your evaluation report for more insights and recommendations. Keep up the great work, and I can’t wait to help you learn even more next time. See you soon"`
        : `${query} (If the query contains requests for a new topic, or a new scenario — whether asked before or during the session — do not proceed. Prompt the user that there's not enough time to start) in short way please and in the end of the answer remind user that your time is going to up, Let's conclude the things (in hightlighted note please)`;

    setIsAIResponse('pending');
    const response = await Patch(
      BaseURL(`session/add-query`),
      {
        slug: sessionData?.slug,
        query: modifyQuery,
        type: extractTime < 60 ? 'end-session' : undefined,
      },
      apiHeader(accessToken)
    );

    if (response) {
      dispatch(setSessionData(response?.data?.data?.session));
      const audio = await generateSpeech(
        response?.data?.data?.aiResponse,
        voiceMode
      );
      addBufferInRedux(response?.data?.data?.aiResponse, audio);
      setIsAIResponse('success');
    } else {
      setIsAIResponse('resolved');
    }
  };

  const onAudioEnd = async () => {
    setIsAIResponse('resolved');
  };

  return (
    <>
      <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded z-50 text-sm">
        <strong>Dashboard Debug:</strong><br/>
        Plan: <code>{user?.subscription?.plan || 'none'}</code><br/>
        Status: <code>{user?.subscription?.status || 'none'}</code><br/>
        Show Plans: <code>{(!user?.subscription?.plan || user?.subscription?.plan === 'none') ? 'YES' : 'NO'}</code>
      </div>
      
      {!user?.subscription?.plan || user?.subscription?.plan === 'none' ? (
        <MainLayout>
          <div className='min-h-screen '>
            <ShowPlans onPurchase={selectPlan} />
          </div>
        </MainLayout>
      ) : isSessionOpen ? (
        <UserDashboard
          addQueryInSession={addQueryInSession}
          isAIResponse={isAIResponse}
          onAudioEnd={onAudioEnd}
          setIsPlaying={setIsPlaying}
          isPlaying={isPlaying}
        />
      ) : (
        <MainLayout>
          <div className='min-h-screen flex-col flex justify-center items-center'>
            <Button onClick={startSesstion} disabled={loading}>
              {loading ? 'Please Wait' : `Start Session`}
            </Button>
            <p className={'mt-5 dark:text-white text-center max-w-[500px]'}>
              <b>Disclaimer</b>
              <p>
                The training session is based on AI to support your learning
                experience. While we strive for accuracy, please be aware that
                AI may occasionally produce errors.
              </p>
            </p>
          </div>
        </MainLayout>
      )}
    </>
  );
}
export default Home;