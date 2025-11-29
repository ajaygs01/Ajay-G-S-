import React from 'react';
import { Button } from './Button';
import { ViewState } from '../types';
import { CheckCircle, Database, Lock, Search } from 'lucide-react';

interface HeroProps {
  onNavigate: (view: ViewState) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-20">
         <div className="absolute top-20 right-0 w-96 h-96 bg-cardano-accent rounded-full blur-[128px]"></div>
         <div className="absolute bottom-0 left-0 w-72 h-72 bg-cardano rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative z-10">
        <div className="text-center lg:text-left lg:flex lg:items-center lg:justify-between">
          <div className="lg:w-1/2">
            <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
              <span className="block">Advance your ideas with</span>
              <span className="block text-cardano-accent">Verified Authenticity</span>
            </h1>
            <p className="mt-3 text-base text-slate-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
              Eliminate fake skill claims with AI-powered validation. We combine Gemini AI and Cardano Blockchain to issue tamper-proof Skill NFTs.
            </p>
            <div className="mt-8 sm:mt-10 sm:flex sm:justify-center lg:justify-start gap-4">
              <Button onClick={() => onNavigate(ViewState.CANDIDATE)}>
                Verify My Skills
              </Button>
              <Button variant="outline" onClick={() => onNavigate(ViewState.EMPLOYER)}>
                I'm an Employer
              </Button>
            </div>
          </div>
          
          {/* Abstract Visualization of Blockchain/AI */}
          <div className="mt-12 lg:mt-0 lg:w-1/2 flex justify-center animate-float">
             <div className="relative w-full max-w-md bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 shadow-2xl">
                <div className="space-y-6">
                   <div className="flex items-center space-x-4 p-4 bg-slate-900/80 rounded-lg border border-slate-700 hover:border-cardano-accent/50 transition-colors">
                      <div className="bg-emerald-500/10 p-2 rounded-lg">
                        <Database className="text-cardano-accent h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Data Processing</h3>
                        <p className="text-xs text-slate-400">AI extracts insights from GitHub & LinkedIn</p>
                      </div>
                   </div>
                   <div className="flex items-center space-x-4 p-4 bg-slate-900/80 rounded-lg border border-slate-700 hover:border-blue-400/50 transition-colors">
                      <div className="bg-blue-500/10 p-2 rounded-lg">
                        <Search className="text-blue-400 h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">AI Verification</h3>
                        <p className="text-xs text-slate-400">Gemini analyzes authenticity & depth</p>
                      </div>
                   </div>
                   <div className="flex items-center space-x-4 p-4 bg-slate-900/80 rounded-lg border border-slate-700 hover:border-purple-400/50 transition-colors">
                      <div className="bg-purple-500/10 p-2 rounded-lg">
                        <Lock className="text-purple-400 h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Skill NFT Minting</h3>
                        <p className="text-xs text-slate-400">On-chain immutable proof of skills</p>
                      </div>
                   </div>
                </div>
                
                <div className="absolute -z-10 -inset-1 bg-gradient-to-r from-cardano-accent to-blue-600 rounded-2xl blur opacity-20"></div>
             </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-24 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:-translate-y-1 transition-transform duration-300">
             <div className="bg-emerald-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="text-cardano-accent h-6 w-6" />
             </div>
             <h3 className="text-lg font-semibold text-white mb-2">AI-Based Verification</h3>
             <p className="text-slate-400">Gemini AI analyzes resumes and portfolios to detect exaggerations and validate technical depth.</p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:-translate-y-1 transition-transform duration-300">
             <div className="bg-blue-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Lock className="text-blue-400 h-6 w-6" />
             </div>
             <h3 className="text-lg font-semibold text-white mb-2">Tamper-Proof Records</h3>
             <p className="text-slate-400">Verified skills are minted as NFTs on the Cardano blockchain, ensuring they cannot be faked.</p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:-translate-y-1 transition-transform duration-300">
             <div className="bg-purple-900/30 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Database className="text-purple-400 h-6 w-6" />
             </div>
             <h3 className="text-lg font-semibold text-white mb-2">Decentralized Identity</h3>
             <p className="text-slate-400">Users own their data via Atala PRISM DID. Portable verified credentials for any job application.</p>
          </div>
        </div>

      </div>
    </div>
  );
};