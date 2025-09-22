'use client';
import { useEffect, useState } from 'react';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import SpeechRecognition from 'react-speech-recognition';
import Button from '../Button';
import './SpeechToText.css';

export default function SpeechToText({
  onSend,
  isAIResponse,
  isPlaying,
  transcript,
  listening,
  resetTranscript,
  browserSupportsSpeechRecognition,
  type = 'mic',
  isSessionPaused,
  onMicClick = () => null,
}) {
  const { user } = useSelector((state) => state.authReducer);
  const [isSending, setIsSending] = useState(false);
  const { isSessionExpired } = useSelector((state) => state.commonReducer);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isSessionPaused) {
      SpeechRecognition?.stopListening();
    }
  }, [isSessionPaused]);

  if (!browserSupportsSpeechRecognition) {
    return <span>{`Browser doesn't support speech recognition.`}</span>;
  }

  return (
    <>
      {type == 'text' ? (
        <div className=' p-3 bg-[#00003026] h-full w-full  '>
          <div
            className={
              'h-[calc(100%-55px)] overflow-y-auto bg-[#fbfbfb] dark:bg-[#6767f626] dark:text-white  border-1 border-[var(--blue-color)] rounded-[inherit] py-2 px-3'
            }
          >
            <p className='font-semibold text-[18px]'>Transcription:</p>
            <p>{transcript || query}</p>
          </div>
          <div className='flex justify-center gap-x-4 mt-3'>
            <Button
              disabled={
                isPlaying ||
                isSending ||
                isSessionExpired ||
                isSessionPaused ||
                ['pending']?.includes(isAIResponse)
              }
              onClick={() => {
                setQuery('');
                resetTranscript();
              }}
            >
              Reset
            </Button>
            <Button
              disabled={
                isPlaying ||
                isSending ||
                isSessionExpired ||
                isSessionPaused ||
                ['pending']?.includes(isAIResponse)
              }
              onClick={async () => {
                if (isPlaying || isSessionExpired) return;
                SpeechRecognition?.stopListening();
                setIsSending(true);
                await onSend(transcript);
                setQuery(transcript);
                resetTranscript();
                setIsSending(false);
              }}
              className={' '}
            >
              {isSending ? 'Wait' : `Send`}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className='flex flex-col justify-center items-center mt-[-60px]'>
            <button
              id='speech'
              class='mic-btn  type2'
              disabled={
                isPlaying ||
                isSending ||
                isSessionExpired ||
                isSessionPaused ||
                ['pending']?.includes(isAIResponse)
              }
              onClick={() => {
                if (listening) {
                  SpeechRecognition?.stopListening();
                  onMicClick('off');
                } else {
                  SpeechRecognition?.startListening({ continuous: true });
                  onMicClick('on');
                }
              }}
            >
              {listening && <div class='pulse-ring'></div>}
              {listening ? <FaMicrophone /> : <FaMicrophoneSlash />}
              <i class='fa fa-microphone' aria-hidden='true'></i>
            </button>
            <p className='mt-2 dark:text-white text-center'>
              {listening ? (
                <>
                  <span>
                    <b className='capitalize'>{user?.preferences}</b> is
                    listening—go ahead and <b>speak</b>!
                  </span>
                </>
              ) : (
                <>
                  Click the <b>microphone icon </b> to{' '}
                  <b>{listening ? 'stop' : 'start'}</b> conversation
                </>
              )}
            </p>
          </div>
          <p className='mt-1 dark:text-white text-[13px]'>
            <b className='block text-[17px] text-red-600'>Important Note:</b>
            To respond, click the <b>mic</b> and <b>begin speaking</b>. When
            you're done, click the <b>Send</b> button to submit your response.
          </p>
        </>
      )}
    </>
  );
}
