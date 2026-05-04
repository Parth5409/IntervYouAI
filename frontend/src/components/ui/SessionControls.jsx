import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './button';
import { cn } from '../../utils/cn';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";

const SessionControls = ({
  isRecording = false,
  isMuted = false,
  sessionTime = 0,
  onToggleRecording,
  onToggleMute,
  onEndSession,
  isConnected = true,
  microphoneLevel = 0,
  showTimer = true,
  showMicLevel = true,
  className
}) => {
  const navigate = useNavigate();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className={cn("fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-6 animate-in slide-in-from-bottom-8 duration-1000", className)}>
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-3 rounded-[2rem] flex items-center justify-between shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)]">

          {/* Status Segment */}
          <div className="flex items-center gap-5 px-8 border-r border-white/5">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-secondary animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.5)]" : "bg-error"
            )} />
            <div className="flex flex-col">
              <span className="font-headline text-[10px] text-white font-black uppercase tracking-widest leading-none">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
              <span className="font-headline text-[8px] text-on-surface-variant/40 font-black uppercase tracking-[0.2em] mt-1.5 italic">
                Active Session
              </span>
            </div>
          </div>

          {/* Controls Segment */}
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleRecording}
              className={cn(
                "w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-500",
                isRecording
                  ? "bg-primary text-white border-primary shadow-[0_0_20px_rgba(99,102,241,0.4)] scale-110"
                  : "bg-white/5 border-white/5 text-on-surface-variant/60 hover:text-white hover:border-white/20 hover:bg-white/10"
              )}
            >
              <Icon name={isRecording ? "ms:stop_circle" : "ms:mic"} size={22} />
            </button>

            <button
              onClick={onToggleMute}
              className={cn(
                "w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-500",
                isMuted
                  ? "bg-error/20 border-error/30 text-error shadow-lg shadow-error/10"
                  : "bg-white/5 border-white/5 text-on-surface-variant/60 hover:text-white hover:border-white/20 hover:bg-white/10"
              )}
            >
              <Icon name={isMuted ? "ms:mic_off" : "ms:volume_up"} size={22} />
            </button>
          </div>

          {/* Timer Segment */}
          {showTimer && (
            <div className="px-8 border-l border-white/5 flex flex-col items-center">
              <div className="font-headline text-lg font-black text-white tabular-nums leading-none italic">
                {formatTime(sessionTime)}
              </div>
              <p className="font-headline text-[8px] text-on-surface-variant/40 font-black uppercase tracking-widest mt-1.5">Session Time</p>
            </div>
          )}

          {/* Termination Segment */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className="ml-6 h-12 px-8 rounded-2xl bg-white/5 border border-white/5 hover:bg-error/10 hover:border-error/20 hover:text-error text-on-surface-variant/60 font-headline font-black text-[10px] uppercase tracking-[0.2em] transition-all"
              >
                End Session
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#0c0c14] border border-white/10 rounded-[2.5rem] p-12 max-w-lg shadow-2xl backdrop-blur-3xl">
              <AlertDialogHeader>
                <div className="w-20 h-20 rounded-3xl bg-error/10 border border-error/20 flex items-center justify-center mx-auto mb-8">
                  <Icon name="ms:warning" size={40} className="text-error" />
                </div>
                <AlertDialogTitle className="text-3xl font-headline font-black text-white text-center uppercase tracking-tight italic">End Session?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-on-surface-variant/60 font-headline font-medium leading-relaxed text-center max-w-sm mx-auto mt-4">
                  Ending this session will stop the interview. Your progress and feedback will be saved.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="sm:justify-center gap-6 mt-12">
                <AlertDialogCancel className="h-14 rounded-2xl flex-1 border border-white/10 bg-white/5 font-headline font-black text-[10px] uppercase tracking-widest text-on-surface-variant/60 hover:bg-white/10 hover:text-white transition-all">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onEndSession} className="h-14 rounded-2xl flex-1 bg-error hover:bg-error/80 text-white font-headline font-black transition-all shadow-xl text-[10px] uppercase tracking-widest">
                  End Session
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </>
  );
};


export default SessionControls;