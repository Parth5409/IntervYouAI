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
      <div className={cn("fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-6 animate-in slide-in-from-bottom-5 duration-700", className)}>
        <div className="bg-surface/60 backdrop-blur-xl border border-outline-variant/20 p-3 rounded-2xl flex items-center justify-between shadow-2xl">

          {/* Status Segment */}
          <div className="flex items-center gap-4 px-6 border-r border-outline-variant/10">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-emerald-500 animate-pulse shadow-md" : "bg-error"
            )} />
            <div className="flex flex-col">
              <span className="font-headline text-[10px] text-white font-bold uppercase tracking-wider leading-none">
                {isConnected ? 'Sync Active' : 'Link Offline'}
              </span>
              <span className="font-headline text-[9px] text-on-surface-variant font-bold uppercase tracking-widest mt-1 opacity-40">
                Network_Node_01
              </span>
            </div>
          </div>

          {/* Controls Segment */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleRecording}
              className={cn(
                "w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-300",
                isRecording
                  ? "bg-primary text-black border-primary shadow-[0_0_20px_rgba(255,145,90,0.3)]"
                  : "bg-surface-container-high border-outline-variant/30 text-on-surface-variant hover:text-white hover:border-outline-variant"
              )}
            >
              <Icon name={isRecording ? "ms:stop_circle" : "ms:mic"} size={22} />
            </button>

            <button
              onClick={onToggleMute}
              className={cn(
                "w-12 h-12 rounded-xl border flex items-center justify-center transition-all duration-300",
                isMuted
                  ? "bg-error/10 border-error text-error"
                  : "bg-surface-container-high border-outline-variant/30 text-on-surface-variant hover:text-white hover:border-outline-variant"
              )}
            >
              <Icon name={isMuted ? "ms:mic_off" : "ms:volume_up"} size={22} />
            </button>
          </div>

          {/* Timer Segment */}
          {showTimer && (
            <div className="px-6 border-l border-outline-variant/10">
              <div className="font-headline text-lg font-bold text-white tabular-nums leading-none">
                {formatTime(sessionTime)}
              </div>
              <p className="font-headline text-[9px] text-on-surface-variant font-bold uppercase tracking-widest mt-1 opacity-40">Duration</p>
            </div>
          )}

          {/* Termination Segment */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="ml-4 h-12 px-6 rounded-xl border-outline-variant/30 hover:border-error/40 hover:text-error font-bold text-xs uppercase tracking-widest bg-transparent text-on-surface-variant"
              >
                Abort
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-surface-container border border-outline-variant/30 rounded-3xl p-10 max-w-lg shadow-2xl backdrop-blur-3xl">
              <AlertDialogHeader>
                <div className="w-16 h-16 rounded-2xl bg-error/10 border border-error/20 flex items-center justify-center mx-auto mb-6">
                  <Icon name="ms:warning" size={32} className="text-error" />
                </div>
                <AlertDialogTitle className="text-2xl font-headline font-extrabold text-white text-center uppercase tracking-tight">Abort Session?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-on-surface-variant font-medium leading-relaxed text-center max-w-xs mx-auto mt-2">
                  Terminating this uplink will end the simulation. All captured telemetry will be preserved for analysis.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="sm:justify-center gap-4 mt-8">
                <AlertDialogCancel className="h-14 rounded-xl flex-1 border-outline-variant/30 font-bold text-xs uppercase tracking-widest text-on-surface-variant">Resume Link</AlertDialogCancel>
                <AlertDialogAction onClick={onEndSession} className="h-14 rounded-xl flex-1 bg-error hover:bg-error-dim text-white font-bold transition-all shadow-xl text-xs uppercase tracking-widest">
                  Terminate
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