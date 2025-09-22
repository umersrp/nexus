'use client';
import { setLastInteractionTime } from '@/store/commonReducer/commonSlice';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classes from './VideoComp.module.css';

export default function VideoComp({
  videoSrc,
  onAudioEnd,
  isPlaying,
  setIsPlaying,
  audioRef,
  isSessionPaused,
  setTextIndex,
}) {
  const { answer } = useSelector((state) => state?.commonReducer);
  const dispatch = useDispatch();
  const videoRef = useRef(null);
  const currentTimeRef = useRef(null);
  const durationRef = useRef(null);
  const timeRef = useRef(1);
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    const handleVideoLoop = () => {
      if (video.currentTime >= video.duration - 0.1) {
        video.currentTime = 0;
        video.play();
      }
    };

    // Attach the timeupdate event listener to loop the video
    audio.addEventListener('timeupdate', handleVideoLoop);

    return () => {
      audio.removeEventListener('timeupdate', handleVideoLoop);
    };
  }, []);

  useEffect(() => {
    if (answer?.base64 && !isSessionPaused) {
      const video = videoRef.current;
      const audio = audioRef.current;
      setTextIndex(0);

      // Start both video and audio when a new audio source is provided
      video.currentTime = 0;
      audio.currentTime = 0;
      video.play();
      audio.play();
    }
    timeRef.current = 1;
  }, [answer?.base64]);

  return (
    <div className=''>
      <video
        ref={videoRef}
        controls={false}
        // controls
        src={videoSrc}
        className={classes?.video}
      >
        <source src='your-video.mp4' type='video/mp4' />
        Your browser does not support the video tag.
      </video>
      <audio
        ref={(e) => {
          audioRef.current = e;
          e?.addEventListener('loadedmetadata', () => {
            if (durationRef.current) {
              const totalSeconds = Math.floor(e.duration);
              const minutes = Math.floor(totalSeconds / 60)
                .toString()
                .padStart(2, '00');
              const seconds = totalSeconds % 60;
              durationRef.current.innerText = `${minutes}:${seconds
                .toString()
                .padStart(2, '00')}`;
            }
          });
        }}
        onTimeUpdateCapture={(e) => {
          const currentTime = e?.nativeEvent?.target?.currentTime;
          const totalDuration = Math.floor(audioRef?.current?.duration);

          if (currentTime.toFixed() == 0) {
            setTextIndex(0);
            timeRef.current = 1; // Reset time reference for the new playback
          }

          if (currentTime.toFixed() == timeRef.current) {
            if (Math.floor(totalDuration) - Math.floor(currentTime) < 2) {
              setTextIndex((prev) => prev + 100);
              document
                ?.getElementById('ai-response-text-div')
                ?.scrollIntoView({ block: 'nearest' });
            } else {
              setTextIndex(
                (prev) =>
                  prev +
                  (timeRef.current % 2 == 0
                    ? Math.floor(
                        answer?.text?.split(' ')?.length / totalDuration
                      )
                    : Math.ceil(
                        answer?.text?.split(' ')?.length / totalDuration
                      ))
              );
              document
                ?.getElementById('ai-response-text-div')
                ?.scrollIntoView({ block: 'nearest' });
            }

            timeRef.current += 1;
          }
        }}
        hidden
        controls={true}
        onEnded={() => {
          videoRef.current.currentTime = 0;
          videoRef.current?.pause();
          setIsPlaying(false);
          onAudioEnd();
        }}
        onPlay={() => {
          setIsPlaying(true);
          videoRef.current.play();

          dispatch(
            setLastInteractionTime({
              minutes: 0,
              seconds: 0,
            })
          );
        }}
        onPause={() => {
          setIsPlaying(false);
          videoRef.current.pause();
        }}
        autoPlay={isPlaying}
        playsInline={true}
        onTimeUpdate={(e) => {
          if (currentTimeRef.current) {
            const totalSeconds = Math.floor(e.target.currentTime);
            const minutes = Math.floor(totalSeconds / 60)
              .toString()
              .padStart(2, '00');
            const seconds = totalSeconds % 60;
            currentTimeRef.current.innerText = `${minutes}:${seconds
              .toString()
              .padStart(2, '00')}`;
          }

          if (videoRef.current.currentTime >= videoRef.current.duration - 0.1) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
          }
        }}
        src={answer?.base64}
      >
        Your browser does not support the audio tag.
      </audio>
    </div>
  );
}
