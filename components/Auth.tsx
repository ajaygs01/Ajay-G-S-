import React, { useState } from 'react';
import { Button } from './Button';
import { User, Lock, Mail, ArrowRight, Github } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthProps {
  mode: 'LOGIN' | 'SIGNUP';
  onLogin: (user: UserType) => void;
  onSwitchMode: (mode: 'LOGIN' | 'SIGNUP') => void;
}

export const Auth: React.FC<AuthProps> = ({ mode, onLogin, onSwitchMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      onLogin({
        name: name || (email.split('@')[0]),
        email: email,
        role: 'candidate'
      });
      setIsLoading(false);
    }, 1000); // Quick response simulation
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8 animate-fade-in relative overflow-hidden">
        
        {/* Decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-cardano-accent to-transparent shadow-[0_0_20px_rgba(30,193,152,0.5)]"></div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            {mode === 'LOGIN' ? 'Welcome Back' : 'Join SkillChain'}
          </h2>
          <p className="text-slate-400">
            {mode === 'LOGIN' 
              ? 'Access your verified credential wallet' 
              : 'Start your journey to verified skills'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'SIGNUP' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-cardano-accent focus:ring-1 focus:ring-cardano-accent transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-cardano-accent focus:ring-1 focus:ring-cardano-accent transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-cardano-accent focus:ring-1 focus:ring-cardano-accent transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-lg shadow-lg shadow-cardano-accent/20"
            isLoading={isLoading}
          >
            {mode === 'LOGIN' ? 'Sign In' : 'Create Account'}
            {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
          </Button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center px-4 py-2 border border-slate-600 rounded-lg shadow-sm text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 transition-colors">
              <Github className="h-5 w-5 mr-2" />
              GitHub
            </button>
            <button className="flex items-center justify-center px-4 py-2 border border-slate-600 rounded-lg shadow-sm text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 transition-colors">
              <span className="font-bold mr-2 text-blue-500">G</span>
              Google
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-slate-400">
          {mode === 'LOGIN' ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => onSwitchMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')}
            className="font-semibold text-cardano-accent hover:text-emerald-300 transition-colors"
          >
            {mode === 'LOGIN' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
};