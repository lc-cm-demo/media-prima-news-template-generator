import React from 'react';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';

interface LoginPageProps {
  onLoginSuccess: (credentialResponse: CredentialResponse) => void;
  onLoginError: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onLoginError,
}) => {
  return (
    <div className="min-h-screen bg-black text-gray-200 flex flex-col items-center justify-center font-sans relative overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black pointer-events-none" />

      <div className="z-10 bg-gray-900/50 p-8 rounded-2xl border border-gray-800 backdrop-blur-md shadow-2xl flex flex-col items-center max-w-md w-full mx-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">Welcome</h1>
          <p className="text-gray-400">Please sign in to continue to Veo Studio</p>
        </div>

        <div className="w-full flex justify-center">
          <GoogleLogin
            onSuccess={onLoginSuccess}
            onError={onLoginError}
            theme="filled_black"
            shape="pill"
            size="large"
          />
        </div>

        <div className="mt-8 text-xs text-center text-gray-500">
          <p>Protected by Google OAuth</p>
        </div>
      </div>
    </div>
  );
};
