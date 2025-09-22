import Button from '@/components/Button';
import { sessionDuration } from '@/config/apiUrl';
import { setLastInteractionTime } from '@/store/commonReducer/commonSlice';
import { Switch } from 'antd';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTimer } from 'react-timer-hook';
import { toast } from 'react-toastify';

export default function TimerComp({
  expiryTimestamp,
  onExpire = () => null,
  onPause = () => null,
  onPlay = () => null,
  timeRef,
  isSessionPause,
  isAIResponse,
  isSessionExpired,
  answer,
  audioRef,
  lastInteractionTime,
}) {
  const dispatch = useDispatch();
  const { seconds, minutes, isRunning, pause, resume } = useTimer({
    expiryTimestamp,
    onExpire: () => {
      onExpire();
      console.log('onExpire called');
    },

    autoStart: !isSessionPause,
  });
  const [visibility, setVisibility] = useState('show');

  function calculateTimeFraction() {
    const rawTimeFraction = (minutes + seconds / 60) / sessionDuration;
    return rawTimeFraction - (1 / sessionDuration) * (1 - rawTimeFraction);
  }
  function setCircleDasharray() {
    const circleDasharray = `${(calculateTimeFraction() * 283).toFixed(0)} 283`;
    document
      .getElementById('base-timer-path-remaining')
      .setAttribute('stroke-dasharray', circleDasharray);
  }

  useEffect(() => {
    setCircleDasharray();
    timeRef.current = {
      time: `${minutes?.toString().padStart(2, '0')}:${seconds
        ?.toString()
        .padStart(2, '0')}`,
      minutes,
      seconds,
    };
    const currentSeconds = minutes * 60 + seconds;
    const isRerenderPlay =
      lastInteractionTime?.minutes * 60 +
      lastInteractionTime?.seconds -
      currentSeconds;
    if (
      isRerenderPlay == 60 &&
      answer?.base64 &&
      !isSessionPause &&
      !isSessionExpired
    ) {
      const audio = audioRef.current;

      if (isRerenderPlay == 60) {
        audio.currentTime = 0;
        dispatch(
          setLastInteractionTime({
            minutes: 0,
            seconds: 0,
          })
        );
      }

      audio.play();
    }
  }, [seconds]);

  return (
    <div className='flex justify-between dark:text-white '>
      <div className={`flex flex-col`}>
        <h6 className='!text-[16px]'>
          Time Left
          <Switch
            checkedChildren='hide'
            unCheckedChildren='show'
            checked={visibility == 'hide'}
            onChange={(e) => {
              setVisibility(e ? 'hide' : 'show');
            }}
            className='!ml-2'
          ></Switch>
        </h6>
        <div
          class={`base-timer   ${
            !isSessionExpired &&
            !isSessionPause &&
            minutes <= 3 &&
            'base-timer-bounce'
          }`}
          style={
            visibility == 'hide'
              ? { visibility: 'hidden', animation: 'none', opacity: 0 }
              : {}
          }
        >
          <svg
            class='base-timer__svg'
            viewBox='0 0 100 100'
            xmlns='http://www.w3.org/2000/svg'
          >
            <g class='base-timer__circle'>
              <circle
                class='base-timer__path-elapsed'
                cx='50'
                cy='50'
                r='45'
              ></circle>
              <path
                id='base-timer-path-remaining'
                stroke-dasharray='283'
                className={`base-timer__path-remaining ${
                  !isSessionExpired && minutes > 5
                    ? 'green'
                    : minutes > 3
                    ? 'orange'
                    : minutes >= 0 && seconds > 0 && 'red'
                }`}
                d='
          M 50, 50
          m -45, 0
          a 45,45 0 1,0 90,0
          a 45,45 0 1,0 -90,0
        '
              ></path>
            </g>
          </svg>
          <span id='base-timer-label' class='base-timer__label'>
            <span>{minutes?.toString().padStart(2, '0')}</span>:
            <span>{seconds?.toString().padStart(2, '0')}</span>
          </span>
        </div>
      </div>
      <Button
        title={(isRunning ? `Pause` : 'Resume') + ' session'}
        className='h-[max-content] !px-[20px]  w-[180px]'
        disabled={isAIResponse == 'pending' || isSessionExpired}
        onClick={() => {
          if (isAIResponse == 'pending') {
            return toast.error(
              "Your query answer is being processed, You can't pause the session"
            );
          }
          if (isRunning) {
            pause();
            onPause(minutes, seconds);
          } else {
            resume();
            onPlay();
          }
        }}
      >
        {isRunning ? `Pause` : 'Resume'} Session
      </Button>
    </div>
  );
}
