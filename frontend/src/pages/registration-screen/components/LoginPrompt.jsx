import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const LoginPrompt = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate('/login-screen');
  };

  return (
    <div className="text-center space-y-4">
      <div className="flex items-center">
        <div className="flex-1 border-t border-border"></div>
        <span className="px-4 text-xs text-muted-foreground">OR</span>
        <div className="flex-1 border-t border-border"></div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Already have an account?
        </p>
        <Button
          variant="outline"
          onClick={handleLoginRedirect}
          fullWidth
          iconName="LogIn"
          iconPosition="left"
        >
          Sign In
        </Button>
      </div>

      {/* Additional Help */}
      <div className="pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">
          Need help getting started?
        </p>
        <div className="flex flex-col space-y-1">
          <button className="text-xs text-primary hover:underline">
            View Demo
          </button>
          <button className="text-xs text-primary hover:underline">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt;