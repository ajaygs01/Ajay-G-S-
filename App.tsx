
import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { VerificationPortal } from './components/VerificationPortal';
import { EmployerDashboard } from './components/EmployerDashboard';
import { CandidateDashboard } from './components/CandidateDashboard';
import { Auth } from './components/Auth';
import { ViewState, User, CertificationDetail, PortalState } from './types';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [user, setUser] = useState<User | null>(null);
  const [verifiedCerts, setVerifiedCerts] = useState<CertificationDetail[]>([]);
  
  // Lifted state for the Verification Portal to persist data across tab switches
  const [portalState, setPortalState] = useState<PortalState>({
    resumeText: '',
    githubUrl: '',
    linkedinUrl: '',
    selectedFile: null,
    isAnalyzing: false,
    result: null,
    error: null,
    useZkPrivacy: false,
    isGeneratingProof: false
  });

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    // Redirect to HOME by default on login/signup as requested
    setCurrentView(ViewState.HOME);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView(ViewState.HOME);
    setVerifiedCerts([]); // Clear session data on logout
    // Optionally clear portal state on logout, but requirement says "until I remove myself", so keeping it persisting is safer unless explicitly cleared.
  };
  
  const handleMint = (newCerts: CertificationDetail[]) => {
    setVerifiedCerts(prev => [...newCerts, ...prev]);
  };

  const renderView = () => {
    switch (currentView) {
      case ViewState.HOME:
        return <Hero onNavigate={setCurrentView} />;
      case ViewState.CANDIDATE:
        return (
          <VerificationPortal 
            user={user} 
            onTriggerLogin={() => setCurrentView(ViewState.LOGIN)} 
            verifiedCerts={verifiedCerts}
            onMint={handleMint}
            portalState={portalState}
            setPortalState={setPortalState}
          />
        );
      case ViewState.DASHBOARD:
        if (!user) return <Auth mode="LOGIN" onLogin={handleLogin} onSwitchMode={() => {}} />;
        return <CandidateDashboard user={user} verifiedCerts={verifiedCerts} />;
      case ViewState.EMPLOYER:
        return <EmployerDashboard verifiedCerts={verifiedCerts} user={user} />;
      case ViewState.LOGIN:
        return <Auth mode="LOGIN" onLogin={handleLogin} onSwitchMode={(mode) => setCurrentView(mode === 'LOGIN' ? ViewState.LOGIN : ViewState.SIGNUP)} />;
      case ViewState.SIGNUP:
        return <Auth mode="SIGNUP" onLogin={handleLogin} onSwitchMode={(mode) => setCurrentView(mode === 'LOGIN' ? ViewState.LOGIN : ViewState.SIGNUP)} />;
      default:
        return <Hero onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-cardano-accent selection:text-slate-900 relative">
      {/* Background is handled by index.html CSS for better performance */}
      
      <Navbar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        user={user}
        onLogout={handleLogout}
      />
      
      <main className="flex-grow flex flex-col">
        {renderView()}
      </main>
      
      <footer className="border-t border-white/5 py-8 bg-slate-900/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm">
            © 2025 SkillChain (Team Terminal Titans). Built for Cardano Hackathon IBW Edition.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
