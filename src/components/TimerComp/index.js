import Button from '@/components/Button';
import { sessionDuration } from '@/config/apiUrl';
import { setLastInteractionTime } from '@/store/commonReducer/commonSlice';
import { Switch, notification } from 'antd';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';

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
  const [seconds, setSeconds] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [isRunning, setIsRunning] = useState(!isSessionPause);
  const [visibility, setVisibility] = useState('show');
  const intervalRef = useRef(null);

  // Calculate initial time from expiry timestamp
  const calculateTimeLeft = useCallback(() => {
    if (!expiryTimestamp) return { minutes: 0, seconds: 0 };

    const now = new Date().getTime();
    const expiry = new Date(expiryTimestamp).getTime();
    const difference = expiry - now;

    if (difference <= 0) {
      // Timer expired
      setIsRunning(false);
      onExpire();
      console.log('onExpire called');
      return { minutes: 0, seconds: 0 };
    }

    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { minutes, seconds };
  }, [expiryTimestamp, onExpire]);

  // Timer logic
  useEffect(() => {
    if (!expiryTimestamp) return;

    // Set initial time
    const initialTime = calculateTimeLeft();
    setMinutes(initialTime.minutes);
    setSeconds(initialTime.seconds);

    if (isRunning && !isSessionPause) {
      intervalRef.current = setInterval(() => {
        setSeconds(prevSeconds => {
          if (prevSeconds === 0) {
            setMinutes(prevMinutes => {
              if (prevMinutes === 0) {
                // Timer expired
                clearInterval(intervalRef.current);
                setIsRunning(false);
                onExpire();
                return 0;
              }
              return prevMinutes - 1;
            });
            return 59;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isSessionPause, expiryTimestamp, calculateTimeLeft, onExpire]);

  // Pause/Resume functions
  const pause = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resume = () => {
    if (!isSessionExpired && minutes + seconds > 0) {
      setIsRunning(true);
    }
  };

  // Update timeRef
  useEffect(() => {
    if (timeRef) {
      timeRef.current = {
        time: `${minutes?.toString().padStart(2, '0')}:${seconds
          ?.toString()
          .padStart(2, '0')}`,
        minutes,
        seconds,
      };
    }
  }, [minutes, seconds, timeRef]);

  // Circle animation functions
  function calculateTimeFraction() {
    const rawTimeFraction = (minutes + seconds / 60) / sessionDuration;
    return rawTimeFraction - (1 / sessionDuration) * (1 - rawTimeFraction);
  }

  function setCircleDasharray() {
    const circleDasharray = `${(calculateTimeFraction() * 283).toFixed(0)} 283`;
    const element = document.getElementById('base-timer-path-remaining');
    if (element) {
      element.setAttribute('stroke-dasharray', circleDasharray);
    }
  }

  useEffect(() => {
    setCircleDasharray();
    
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
  }, [seconds, minutes, lastInteractionTime, answer, isSessionPause, isSessionExpired, audioRef, dispatch]);

  const handlePauseResume = () => {
    if (isAIResponse == 'pending') {
      notification.error({
        message: 'Processing',
        description: "Your query answer is being processed, You can't pause the session",
      });
      return;
    }

    if (isRunning) {
      pause();
      onPause(minutes, seconds);
    } else {
      resume();
      onPlay();
    }
  };

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
          className={`base-timer   ${
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
            className='base-timer__svg'
            viewBox='0 0 100 100'
            xmlns='http://www.w3.org/2000/svg'
          >
            <g className='base-timer__circle'>
              <circle
                className='base-timer__path-elapsed'
                cx='50'
                cy='50'
                r='45'
              ></circle>
              <path
                id='base-timer-path-remaining'
                strokeDasharray='283'
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
          <span id='base-timer-label' className='base-timer__label'>
            <span>{minutes?.toString().padStart(2, '0')}</span>:
            <span>{seconds?.toString().padStart(2, '0')}</span>
          </span>
        </div>
      </div>
      <Button
        title={(isRunning ? `Pause` : 'Resume') + ' session'}
        className='h-[max-content] !px-[20px]  w-[180px]'
        disabled={isAIResponse == 'pending' || isSessionExpired}
        onClick={handlePauseResume}
      >
        {isRunning ? `Pause` : 'Resume'} Session
      </Button>
    </div>
  );
}