'use client';

import { Post } from '@/Axios/AxiosFunctions';
import Button from '@/components/Button';
import MainLayout from '@/components/MainLayout';
import TimerComp from '@/components/TimerComp';
import VideoComp from '@/components/VideoComp';
import { apiHeader, BaseURL, sessionDuration } from '@/config/apiUrl';
import { getCalculatedSeconds, getPreferenceVideo } from '@/config/helper';
import AddFeedbackModal from '@/modals/AddFeedbackModal';
import store from '@/store';
import {
  setIsSessionExpired,
  setIsSessionOpen,
  setLastInteractionTime,
  setSessionPause,
  setSessionResume,
} from '@/store/commonReducer/commonSlice';
import { Col, Row, Spin } from 'antd';
import { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import { useDispatch, useSelector } from 'react-redux';
import { useSpeechRecognition } from 'react-speech-recognition';
import { toast } from 'react-toastify';
import SpeechToText from '../SpeechToText';
import { useRouter } from 'next/navigation';

function UserDashboard({
  addQueryInSession,
  isAIResponse,
  onAudioEnd,
  isPlaying,
  setIsPlaying,
}) {
  const router = useRouter();
  const audioRef = useRef(null);
  const timeRef = useRef(null);
  const dispatch = useDispatch();
  const {
    sessionStartTime,
    isSessionExpired,
    sessionData,
    answer,
    isSessionPause,
    sessionTakenTime,
    lastInteractionTime,
  } = store.getState()?.commonReducer;
  const { accessToken, user } = useSelector((state) => state?.authReducer);
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [textIndex, setTextIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  const onExpire = () => {
    dispatch(setIsSessionExpired(true));
  };
  const time = getCalculatedSeconds(
    sessionStartTime,
    sessionDuration - sessionTakenTime * 1000 * 60,
    sessionTakenTime
  );
  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();

      dispatch(
        setLastInteractionTime({
          minutes: timeRef.current?.minutes,
          seconds: timeRef.current?.seconds,
        })
      );
    } else {
      audioRef.current?.play();

      dispatch(
        setLastInteractionTime({
          minutes: 0,
          seconds: 0,
        })
      );
    }
  };

  const handleSubmitFeedback = async (params) => {
    const response = await Post(
      BaseURL(`session/submit-feedback`),
      {
        sessionId: sessionData?._id,
        ...params,
      },
      apiHeader(accessToken)
    );
    if (response) {
      toast.success('Thank you for your feedback');
      dispatch(setIsSessionOpen(false));
      dispatch(setIsSessionExpired(false));
      router.push('/sessions');
    }
  };
  useEffect(() => {
    if (listening) {
      setIsPlaying(false);
      audioRef.current?.pause();
    }
  }, [listening]);

  useEffect(() => {
    if (
      isSessionExpired &&
      !isPlaying &&
      !['pending', 'success'].includes(isAIResponse)
    ) {
      setShowFeedback(true);
    }
  }, [isSessionExpired, isPlaying, isAIResponse]);

  return (
    <MainLayout>
      <div className=' '>
        <Row
          gutter={[20, 16]}
          className='border-[var(--primary-color)] border-solid border-[2px]  rounded h-[calc(50vh-55px)]'
        >
          <Col
            md={12}
            xs={12}
            sm={12}
            className='border-[var(--primary-color)] border-solid border-e-[2px]   !px-0'
          >
            <Spin
              spinning={isAIResponse == 'pending'}
              tip='Generating response'
              size='large'
              wrapperClassName='h-full'
            >
              <VideoComp
                videoSrc={getPreferenceVideo(user?.preferences)}
                onAudioEnd={() => {
                  onAudioEnd();
                  setIsPlaying(false);

                  if (isSessionExpired) {
                    setShowFeedback(true);
                  }
                  dispatch(
                    setLastInteractionTime({
                      minutes: timeRef.current?.minutes,
                      seconds: timeRef.current?.seconds,
                    })
                  );
                }}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                audioRef={audioRef}
                isSessionPaused={isSessionPause}
                setTextIndex={setTextIndex}
                isSessionExpired={isSessionExpired}
              />
            </Spin>
          </Col>
          <Col md={12} xs={12} sm={12} className=' !px-0 h-[inherit]'>
            <Spin
              spinning={isAIResponse == 'pending'}
              tip='Generating response'
              size='large'
              wrapperClassName='h-full bg-[#00003026] p-3 '
            >
              <div
                className={
                  'h-full   bg-[#fbfbfb] dark:bg-[#6767f626] dark:text-white  '
                }
              >
                <div className='mb-2 h-[calc(100%-60px)] px-3  py-2 overflow-x-auto'>
                  {sessionData?.queries
                    ?.filter((a) => a?.query != answer?.text)
                    ?.map((item) => {
                      return (
                        <>
                          <p className='font-semibold text-[18px] mb-2'>
                            {item?.msgType == 'greet'
                              ? 'Greetings!'
                              : item?.msgType == 'give-topic-intro'
                              ? 'Vocabulary Introduction:'
                              : item?.type == 'ai'
                              ? 'AI Answer:'
                              : 'You:'}{' '}
                          </p>
                          <p className='markdown mb-2'>
                            <Markdown>{item?.query}</Markdown>
                          </p>
                        </>
                      );
                    })}

                  {sessionData?.queries?.length > 1 && (
                    <hr className='border-2 border-black dark:border-white my-4' />
                  )}

                  <p className='font-semibold text-[20px]'>Response:</p>
                  {answer?.text && (
                    <p className='markdown'>
                      <Markdown>
                        {answer?.text
                          ?.split(' ')
                          ?.slice(0, textIndex)
                          ?.join(' ')}
                      </Markdown>
                    </p>
                  )}
                  <div id={'ai-response-text-div'} />
                </div>
                <div className='bg-[#00003026] pt-[10px]'>
                  <Button
                    className={' block mx-auto '}
                    disabled={
                      listening ||
                      isSessionPause ||
                      (isPlaying && isSessionExpired)
                    }
                    onClick={() => {
                      togglePlayPause();
                    }}
                  >
                    {isPlaying ? `Pause` : `Play`}
                  </Button>
                </div>
              </div>
            </Spin>
          </Col>
        </Row>

        <Row
          gutter={[20, 16]}
          className='border-[var(--primary-color)] mt-3 border-solid border-[2px] h-[calc(50vh-55px)] rounded'
        >
          <Col
            md={12}
            xs={12}
            sm={12}
            className='border-[var(--primary-color)] border-solid border-e-[2px] py-3  px-5'
          >
            <div className='flex flex-col justify-between h-full'>
              <TimerComp
                isSessionExpired={isSessionExpired}
                expiryTimestamp={time}
                onExpire={onExpire}
                timeRef={timeRef}
                answer={answer}
                audioRef={audioRef}
                lastInteractionTime={lastInteractionTime}
                addQueryInSession={(t) => addQueryInSession('', t)}
                onPause={(mins, seconds) => {
                  let remaining = sessionDuration - (mins + seconds / 60);
                  dispatch(setSessionPause(remaining / 60 / 1000));
                  if (isPlaying) {
                    audioRef.current?.pause();
                    dispatch(
                      setLastInteractionTime({ minutes: mins, seconds })
                    );
                  }
                }}
                onPlay={() => {
                  dispatch(setSessionResume());
                }}
                isSessionPause={isSessionPause}
                isAIResponse={isAIResponse}
                listening={listening}
              />
              <SpeechToText
                onSend={(q) => addQueryInSession(q, timeRef.current?.time)}
                isAIResponse={isAIResponse}
                isPlaying={isPlaying}
                listening={listening}
                browserSupportsSpeechRecognition={
                  browserSupportsSpeechRecognition
                }
                onMicClick={(status) => {
                  dispatch(
                    setLastInteractionTime({
                      minutes: status == 'on' ? 0 : timeRef.current?.minutes,
                      seconds: status == 'on' ? 0 : timeRef.current?.seconds,
                    })
                  );
                }}
                resetTranscript={resetTranscript}
                transcript={transcript}
                isSessionPaused={isSessionPause}
                key={'mic'}
              />
            </div>
          </Col>
          <Col md={12} sm={12} xs={12} className='!px-0 flex-grow-[1]'>
            <Spin
              spinning={isAIResponse == 'pending'}
              tip='Generating response'
              size='large'
              wrapperClassName=' h-full
              '
            >
              <div className='h-[inherit]   overflow-y-auto'>
                <SpeechToText
                  onSend={async (q) => {
                    await addQueryInSession(q, timeRef.current?.time);
                    setTextIndex(0);
                  }}
                  isAIResponse={isAIResponse}
                  isPlaying={isPlaying}
                  listening={listening}
                  browserSupportsSpeechRecognition={
                    browserSupportsSpeechRecognition
                  }
                  resetTranscript={resetTranscript}
                  transcript={transcript}
                  type='text'
                  key={'text'}
                  isSessionPaused={isSessionPause}
                />
              </div>
            </Spin>
          </Col>
        </Row>

        <AddFeedbackModal
          show={
            isSessionExpired &&
            !isPlaying &&
            !['pending', 'success'].includes(isAIResponse) &&
            showFeedback
          }
          onClick={handleSubmitFeedback}
          setShow={() => null}
        />
      </div>
    </MainLayout>
  );
}

export default UserDashboard;
