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
import { Col, Row } from 'antd';
import moment from 'moment';
import { lazy, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import 'regenerator-runtime/runtime';
import { getPreferenceVoice } from '../../../config/helper';
import './dashboard.css';

const UserDashboard = lazy(() => import('@/components/UserDashboard'));

const ShowPlans = ({ onPurchase }) => {
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
  return (
    <Row className='mt-2' gutter={[16, 16]}>
      <Col xs={24}>
        <h5 className='font-semibold dark:text-white'>
          To start your session, Please{' '}
          <span className='font-bold cursor-pointer text-[var(--blue-color)] '>
            select plan
          </span>{' '}
          first
        </h5>
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
            <PlanCard key={i} data={a} onPurchase={() => onPurchase(a?._id)} />
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

  const selectPlan = async (id) => {
    const response = await Post(
      BaseURL(`auth/select-plan`),
      { planId: id },
      apiHeader(accessToken)
    );
    if (response) {
      toast.success('Plan purchased successfully');
      dispatch(updateUser(response?.data?.data?.user));
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
      toast.success('Session started successfully');
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
      {!user?.plan ? (
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
