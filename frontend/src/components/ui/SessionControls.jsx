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
      {/* Main Session Controls */}
      <div className={cn("fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-6 animate-in slide-in-from-bottom-5 duration-700 delay-300", className)}>
        <div className="bg-surface-container-high/60 backdrop-blur-3xl border border-outline-variant/10 p-3 rounded-3xl flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]">

          {/* Status Segment */}
          <div className="flex items-center gap-4 px-6 border-r border-outline-variant/10">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-error"
            )} />
            <div className="flex flex-col">
              <span className="font-headline text-[9px] text-white font-extrabold uppercase tracking-[0.2em] leading-none">
                {isConnected ? 'Stream Active' : 'Disconnected'}
              </span>
              <span className="font-body text-[8px] text-on-surface-variant font-bold uppercase tracking-widest mt-1 opacity-40">
                Network Node 01
              </span>
            </div>
          </div>

          {/* Controls Segment */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleRecording}
              className={cn(
                "w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-500",
                isRecording
                  ? "bg-error/10 border-error text-error shadow-[0_0_20px_rgba(255,115,81,0.2)]"
                  : "bg-surface-container-highest border-outline-variant/10 text-on-surface-variant hover:text-white hover:border-outline-variant"
              )}
            >
              <Icon name={isRecording ? "ms:stop_circle" : "ms:mic"} size={22} />
            </button>

            <button
              onClick={onToggleMute}
              className={cn(
                "w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-500",
                isMuted
                  ? "bg-error/10 border-error text-error"
                  : "bg-surface-container-highest border-outline-variant/10 text-on-surface-variant hover:text-white hover:border-outline-variant"
              )}
            >
              <Icon name={isMuted ? "ms:mic_off" : "ms:volume_up"} size={22} />
            </button>
          </div>

          {/* Timer Segment */}
          {showTimer && (
            <div className="px-6 border-l border-outline-variant/10">
              <div className="font-headline text-lg font-extrabold text-white tracking-tighter tabular-nums leading-none">
                {formatTime(sessionTime)}
              </div>
              <p className="font-body text-[8px] text-on-surface-variant font-bold uppercase tracking-widest mt-1 opacity-40">Session Duration</p>
            </div>
          )}

          {/* Termination Segment */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="ml-4 h-12 px-6 rounded-2xl border-outline-variant/10 hover:border-error/20 hover:text-error text-xs uppercase tracking-widest font-bold bg-transparent"
              >
                End Session
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-surface-container-high border-outline-variant/10 rounded-[2.5rem] p-12 max-w-lg shadow-2xl">
              <AlertDialogHeader>
                <div className="w-20 h-20 rounded-3xl bg-error/10 border border-error/20 flex items-center justify-center mx-auto mb-8">
                  <Icon name="ms:warning" size={40} className="text-error" />
                </div>
                <AlertDialogTitle className="text-3xl font-headline font-extrabold text-white tracking-tight text-center">Terminate Session?</AlertDialogTitle>
                <AlertDialogDescription className="text-[13px] text-on-surface-variant font-medium leading-relaxed text-center max-w-xs mx-auto mt-4">
                  Confirming termination will end the current simulation.
                  All captured data will be processed for analysis.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="sm:justify-center gap-4 mt-10">
                <AlertDialogCancel className="h-16 rounded-2xl flex-1 border-outline-variant/10 font-bold uppercase tracking-widest text-xs">Stay in Session</AlertDialogCancel>
                <AlertDialogAction onClick={onEndSession} className="h-16 rounded-2xl flex-1 bg-error hover:bg-error-dim text-white font-bold uppercase tracking-widest text-xs transition-all shadow-xl">
                  End Interview
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