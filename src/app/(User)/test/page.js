'use client';
import TimerComp from '@/components/TimerComp';
import VideoComp from '@/components/VideoComp';
import { lazy } from 'react';
// import 'regenerator-runtime/runtime';

const SpeechToText = lazy(() => import('@/components/SpeechToText'));

export default function Test() {
  const time = new Date();
  time.setSeconds(time.getSeconds() + 600); // 10 minutes timer
  return (
    <div className='mt-[10px] '>
      <TimerComp expiryTimestamp={time} />
      <div className='  flex justify-center items-center flex-col py-[40px]'>
        <VideoComp videoSrc={'/monkey.mp4'} />
        <SpeechToText />
      </div>
    </div>
  );
}
