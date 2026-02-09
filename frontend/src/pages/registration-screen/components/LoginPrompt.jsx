import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const LoginPrompt = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center space-y-6 pt-6 border-t border-slate-800 mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-mono">
          <span className="bg-slate-900 px-2 text-slate-500 tracking-widest">Already Registered?</span>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          onClick={() => navigate('/login')}
          className="w-full h-10 text-xs"
        >
          Return to Login
        </Button>
      </div>
    </div>
  );
};

export default LoginPrompt;