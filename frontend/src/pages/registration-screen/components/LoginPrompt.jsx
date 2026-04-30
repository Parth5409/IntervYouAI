import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/button';

const LoginPrompt = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center space-y-6 pt-6 border-t border-outline-variant/30 mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-outline-variant/30" />
        </div>
        <div className="relative flex justify-center text-[10px] font-mono font-label font-medium text-on-surface-variant">
          <span className="bg-surface-container-low px-2 text-on-surface-variant tracking-widest">Already Registered?</span>
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