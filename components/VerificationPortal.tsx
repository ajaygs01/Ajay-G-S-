
import React, { useState, useRef, useMemo } from 'react';
import { Button } from './Button';
import { analyzeResume } from '../services/geminiService';
import { AnalysisResult, User, CertificationDetail, SkillVerification, PortalState } from '../types';
import { AlertTriangle, BrainCircuit, Share2, Upload, FileText, Trash2, Award, Hash, Plus, User as UserIcon, Lock, XCircle, Check, Shield, Eye, XOctagon, Github, Linkedin, Link, Copy, ChevronDown, ChevronUp, ShieldCheck, HelpCircle } from 'lucide-react';

interface VerificationPortalProps {
  user: User | null;
  onTriggerLogin: () => void;
  verifiedCerts: CertificationDetail[];
  onMint: (certs: CertificationDetail[]) => void;
  portalState: PortalState;
  setPortalState: React.Dispatch<React.SetStateAction<PortalState>>;
}

// Helper to categorize skills
const categorizeSkills = (skills: SkillVerification[]) => {
  const categories: Record<string, string[]> = {
    Frontend: ['react', 'angular', 'vue', 'html', 'css', 'tailwind', 'redux', 'frontend', 'javascript', 'typescript', 'web'],
    Backend: ['node', 'express', 'django', 'python', 'java', 'spring', 'api', 'backend', 'sql', 'database', 'go', 'rust'],
    Blockchain: ['cardano', 'solidity', 'ethereum', 'smart contract', 'web3', 'blockchain', 'plutus', 'haskell', 'crypto'],
    'AI/ML': ['python', 'tensorflow', 'pytorch', 'ai', 'machine learning', 'data science', 'nlp', 'llm', 'genai'],
    'Soft Skills': ['leadership', 'communication', 'management', 'agile', 'scrum', 'team'],
  };

  const grouped: Record<string, SkillVerification[]> = {};
  
  skills.forEach(skill => {
    let matched = false;
    const lowerName = skill.skillName.toLowerCase();
    
    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some(k => lowerName.includes(k))) {
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(skill);
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      if (!grouped['Other']) grouped['Other'] = [];
      grouped['Other'].push(skill);
    }
  });

  return grouped;
};

export const VerificationPortal: React.FC<VerificationPortalProps> = ({ 
  user, 
  onTriggerLogin, 
  verifiedCerts, 
  onMint, 
  portalState, 
  setPortalState 
}) => {
  const { 
    resumeText, 
    githubUrl, 
    linkedinUrl, 
    selectedFile, 
    isAnalyzing, 
    result, 
    error, 
    useZkPrivacy, 
    isGeneratingProof 
  } = portalState;

  const updateState = (updates: Partial<PortalState>) => {
    setPortalState(prev => ({ ...prev, ...updates }));
  };
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [viewingCert, setViewingCert] = useState<CertificationDetail | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const verifiedSkillsCount = useMemo(() => {
    const uniqueSkills = new Set();
    verifiedCerts.forEach(cert => {
        cert.skills?.forEach(s => uniqueSkills.add(s.skillName));
    });
    return uniqueSkills.size;
  }, [verifiedCerts]);

  // Determine Active Data (Prioritize current result or specific view, do NOT fallback to general history for the scanner)
  const activeData = useMemo(() => {
    if (viewingCert) {
      return {
        name: viewingCert.name,
        issuer: viewingCert.issuer,
        date: viewingCert.issueDate,
        score: viewingCert.score || 0,
        skills: viewingCert.skills || [],
        credentialId: viewingCert.credentialId,
        socialLinks: viewingCert.socialLinks,
        nftId: viewingCert.nftId
      };
    }
    
    // Only show result data if it is authentic
    if (result && result.isDocumentAuthentic && result.certifications.length > 0) {
      const c = result.certifications[0];
      return {
        name: c.name,
        issuer: c.issuer,
        date: c.issueDate,
        score: result.overallAuthenticityScore,
        skills: result.skills,
        credentialId: c.credentialId,
        socialLinks: { github: githubUrl, linkedin: linkedinUrl },
        nftId: "PENDING-MINT"
      };
    }

    return null;
  }, [viewingCert, result, githubUrl, linkedinUrl]);

  const groupedSkills = useMemo(() => activeData ? categorizeSkills(activeData.skills) : {}, [activeData]);
  const topSkills = useMemo(() => activeData ? activeData.skills.sort((a, b) => b.confidenceScore - a.confidenceScore).slice(0, 7) : [], [activeData]);

  // QR Code Target URL (Strictly active data)
  const qrTargetUrl = useMemo(() => {
      if (!activeData || !user) return "";
      
      // Generating specific data format as requested
      return `Name: ${user.name}
Resource: ${activeData.name}
DID: did:cardano:889025946c1e550c
Overall Trust Score: ${activeData.score}%
Status: Verified
NFT ID: ${activeData.nftId || 'N/A'}`;
  }, [activeData, user]);

  const handleDemoFill = () => {
    setViewingCert(null); // Clear viewing mode so new input takes priority
    updateState({
      resumeText: `Anil Kumar K R
Senior Frontend Developer

Profile Summary:
Passionate developer with 10 years of experience in React, Node.js, and Blockchain. I have architected large-scale distributed systems handling millions of transactions.

Skills:
- React.js: Expert
- Node.js: Advanced
- Cardano Smart Contracts: Beginner`,
      githubUrl: 'https://github.com/anilkumarkr',
      linkedinUrl: 'https://linkedin.com/in/anilkumarkr',
      error: null
    });
  };

  const handleUploadClick = () => {
    if (!user) {
      onTriggerLogin();
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setViewingCert(null); // Clear viewing mode so the new file takes priority
    // New file selected: Clear previous errors AND previous results
    updateState({ error: null, result: null });
    
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        updateState({ error: "Unsupported file format. Please upload a PDF, JPG, or PNG file." });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        updateState({ error: "File size exceeds the 5MB limit. Please compress your file or try a smaller one." });
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result as string;
        updateState({ selectedFile: { file, preview: result } });
      };

      reader.onerror = () => {
        updateState({ error: "Failed to read the file. It might be corrupted or unreadable." });
      };
      
      reader.readAsDataURL(file);
    }
  };

  const clearFile = () => {
    // When removing the resource, explicitly clear the result as requested
    setViewingCert(null);
    updateState({ selectedFile: null, error: null, result: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Helper to completely clear the session
  const clearSession = () => {
    setViewingCert(null);
    updateState({
       resumeText: '',
       githubUrl: '',
       linkedinUrl: '',
       selectedFile: null,
       result: null,
       error: null
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64Data = reader.result.split(',')[1];
          resolve(base64Data);
        } else {
          reject(new Error("Failed to process file data."));
        }
      };
      reader.onerror = () => reject(new Error("Error reading file data."));
    });
  };

  const handleAnalyze = async () => {
    if (!user) {
      onTriggerLogin();
      return;
    }

    if (!resumeText.trim() && !selectedFile) return;
    
    setViewingCert(null); // Clear viewing mode so the new analysis takes priority
    updateState({ isAnalyzing: true, error: null, result: null });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Verification timed out. The server took too long to respond. Please try again.")), 30000)
    );

    try {
      if (useZkPrivacy) {
        updateState({ isGeneratingProof: true });
        await new Promise(resolve => setTimeout(resolve, 2000));
        updateState({ isGeneratingProof: false });
      }

      let fileData = undefined;
      if (selectedFile) {
        try {
          const base64 = await fileToBase64(selectedFile.file);
          fileData = {
            mimeType: selectedFile.file.type,
            data: base64
          };
        } catch (readErr) {
          throw new Error("Could not prepare file for upload. Please try again.");
        }
      }

      const socialLinks = {
        github: githubUrl || undefined,
        linkedin: linkedinUrl || undefined
      };

      const analysis = await Promise.race([
        analyzeResume(resumeText, fileData, socialLinks),
        timeoutPromise
      ]) as AnalysisResult;

      updateState({ result: analysis });

    } catch (err: any) {
      console.error("Verification Error:", err);
      let message = err.message || 'An unexpected error occurred during verification.';
      
      if (message.includes('400')) message = "The document content could not be processed. It might be corrupted or empty.";
      if (message.includes('401') || message.includes('403')) message = "Authentication with the AI service failed. Please check your configuration.";
      if (message.includes('503') || message.includes('Overloaded')) message = "The AI service is currently busy. Please try again in a moment.";
      if (message.includes('fetch') || message.includes('network')) message = "Network error. Please check your internet connection.";
      if (message.includes('SAFETY')) message = "The document was flagged by safety filters and cannot be processed.";
      
      updateState({ error: message, isGeneratingProof: false });
    } finally {
      updateState({ isAnalyzing: false });
    }
  };

  const handleMint = () => {
    if (!user) {
      onTriggerLogin();
      return;
    }
    
    if (result && !result.isDocumentAuthentic) {
      updateState({ error: "Cannot mint fake or rejected documents." });
      return;
    }

    if (result && result.certifications.length > 0) {
       // Generate a random NFT ID for the new credential
       const randomId = Math.floor(1000 + Math.random() * 9000);
       const nftId = `NFT-${randomId}`;

       const newCerts = result.certifications
         .map(c => ({ 
           ...c, 
           score: result.overallAuthenticityScore,
           zkProof: useZkPrivacy ? `zk-${Math.random().toString(36).substring(2, 15)}...${Math.random().toString(36).substring(2, 6)}` : undefined,
           socialLinks: { github: githubUrl, linkedin: linkedinUrl },
           skills: result.skills,
           nftId: nftId 
         }))
         .filter(c => 
           !verifiedCerts.some(vc => vc.credentialId === c.credentialId && vc.name === c.name)
         );
       
       if (newCerts.length > 0) {
          onMint(newCerts);
          // Do NOT clear result here so users can see what they just minted until they close it
          alert(`Credential successfully minted as an NFT on Cardano! Your NFT ID is ${nftId}`);
       } else {
          alert("Credential already in your wallet.");
       }
    } else {
       alert("No verifiable certification details found to mint.");
    }
  };

  const handleShare = async (cert?: CertificationDetail) => {
    // If explicit cert provided use it, otherwise fallback to activeData if available
    const data = cert ? {
        name: cert.name,
        issuer: cert.issuer,
        date: cert.issueDate,
        id: cert.credentialId,
        score: cert.score,
        nftId: cert.nftId
    } : (activeData ? {
        name: activeData.name,
        issuer: activeData.issuer,
        date: activeData.date,
        id: activeData.credentialId,
        score: activeData.score,
        nftId: activeData.nftId
    } : null);

    if (!data) return;

    const candidateName = user ? user.name : "Guest";
    // Exact format requested
    const shareText = `✅ VERIFIED CREDENTIAL

Candidate: ${candidateName}
Certification: ${data.name}
Issuer: ${data.issuer}
Date: ${data.date}
Credential ID: ${data.id || 'N/A'}
NFT ID: ${data.nftId || 'Pending'}
Trust Score: ${data.score}%

Verified on SkillChain`;

    if (navigator.share && navigator.canShare && navigator.canShare({ text: shareText })) {
      try {
        await navigator.share({
          text: shareText
        });
      } catch (err) {
        navigator.clipboard.writeText(shareText);
        alert("Verification details copied to clipboard!");
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Verification details copied to clipboard!");
    }
  };

  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!user) {
      onTriggerLogin();
      return;
    }
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        updateState({ error: "Unsupported file format. Please upload a PDF, JPG, or PNG file." });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        updateState({ error: "File size exceeds 5MB limit." });
        return;
      }
      setViewingCert(null); // Clear viewing mode
      // New file dropped: Clear result
      updateState({ error: null, result: null });
      const reader = new FileReader();
      reader.onload = (e) => {
        updateState({ selectedFile: { file, preview: e.target?.result as string } });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Profile Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-gradient-to-br from-cardano to-blue-600 rounded-full flex items-center justify-center shadow-lg relative">
             <UserIcon className="h-8 w-8 text-white" />
             {!user && (
               <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-1 border border-slate-600">
                 <Lock className="w-3 h-3 text-slate-400" />
               </div>
             )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Welcome, {user?.name || 'Guest'}</h2>
            {user ? (
              <p className="text-slate-400 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Identity Verified (DID: 1z2...9x)
              </p>
            ) : (
              <p className="text-slate-500 text-sm">Verify documents freely. Log in to mint NFTs.</p>
            )}
          </div>
        </div>
        <div className="flex gap-4 text-sm opacity-90">
           <div className="px-4 py-2 bg-slate-900 rounded-lg border border-slate-700">
              <p className="text-slate-400 text-xs uppercase">Verified Skills</p>
              <p className="text-xl font-bold text-white">
                {verifiedSkillsCount > 0 ? verifiedSkillsCount : '-'}
              </p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Verification Tool */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* Action Card */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden relative">
             <div className="bg-slate-900/50 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                <h3 className="font-semibold text-white flex items-center">
                  <Plus className="w-5 h-5 text-cardano-accent mr-2" />
                  Verify New Credential
                </h3>
                <div className="flex items-center gap-3">
                  <div className="group relative flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-700 cursor-help">
                    <span className={`text-[10px] font-bold ${useZkPrivacy ? 'text-purple-400' : 'text-slate-500'}`}>
                      MIDNIGHT PRIVACY
                    </span>
                    <button 
                      onClick={() => updateState({ useZkPrivacy: !useZkPrivacy })}
                      className={`relative w-8 h-4 rounded-full transition-colors ${useZkPrivacy ? 'bg-purple-600' : 'bg-slate-700'}`}
                    >
                      <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${useZkPrivacy ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </button>
                    {/* Tooltip for Privacy */}
                    <div className="absolute bottom-full right-0 mb-2 w-56 p-2 bg-slate-800 text-xs text-slate-300 rounded-lg border border-slate-700 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                       <div className="flex items-start gap-2">
                         <HelpCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                         <span>Generate ZK Proofs to verify skills without revealing raw resume data on-chain.</span>
                       </div>
                    </div>
                  </div>
                </div>
             </div>
             
             <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div 
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all relative overflow-hidden ${
                      isDragging ? 'border-cardano-accent bg-cardano-accent/10' : 
                      selectedFile ? 'border-cardano-accent bg-cardano-accent/5' : 
                      'border-slate-600 hover:border-slate-500 hover:bg-slate-700/30'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange} 
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      className="hidden"
                    />
                    {!selectedFile ? (
                      <div className="cursor-pointer flex flex-col items-center justify-center h-full relative z-10" onClick={handleUploadClick}>
                        {!user && <div className="absolute top-0 right-0 p-1"><Lock className="w-4 h-4 text-slate-500" /></div>}
                        <div className="bg-slate-700/50 p-4 rounded-full mb-3 group-hover:bg-slate-700 transition-colors">
                           <Upload className={`h-6 w-6 ${user ? 'text-cardano-accent' : 'text-slate-400'}`} />
                        </div>
                        <p className="text-white font-medium text-sm">
                          {user ? 'Upload Certificate / Resume' : 'Log In to Upload'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                      </div>
                    ) : (
                      <div className="relative h-full flex flex-col items-center justify-center z-10">
                        <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-lg border border-slate-700 w-full max-w-[200px]">
                          {selectedFile.file.type.startsWith('image/') ? (
                            <img src={selectedFile.preview || ''} alt="Preview" className="h-12 w-12 object-cover rounded bg-slate-800 flex-shrink-0" />
                          ) : (
                            <div className="h-12 w-12 bg-red-500/10 rounded flex items-center justify-center border border-red-500/20 flex-shrink-0">
                                <FileText className="h-6 w-6 text-red-500" />
                            </div>
                          )}
                          <div className="text-left overflow-hidden">
                            <p className="text-white text-sm font-medium truncate">{selectedFile.file.name}</p>
                            <p className="text-[10px] text-slate-500">{(selectedFile.file.size / 1024).toFixed(0)} KB</p>
                          </div>
                        </div>
                        <button onClick={clearFile} className="mt-3 text-xs text-red-400 hover:text-red-300 flex items-center bg-slate-900/50 px-2 py-1 rounded">
                          <Trash2 className="h-3 w-3 mr-1" /> Remove
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    <textarea
                      value={resumeText}
                      onChange={(e) => {
                        setViewingCert(null);
                        updateState({ resumeText: e.target.value });
                      }}
                      placeholder="Or paste claim text here..."
                      className="w-full flex-grow bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm text-slate-200 focus:ring-1 focus:ring-cardano-accent focus:border-cardano-accent transition-all resize-none min-h-[100px]"
                    />
                    <div className="space-y-2">
                       <div className="relative">
                         <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                         <input 
                           type="text" 
                           placeholder="GitHub URL" 
                           value={githubUrl} 
                           onChange={e => {
                             setViewingCert(null);
                             updateState({ githubUrl: e.target.value });
                           }} 
                           className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500" 
                         />
                       </div>
                       <div className="relative">
                         <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                         <input 
                           type="text" 
                           placeholder="LinkedIn URL" 
                           value={linkedinUrl} 
                           onChange={e => {
                             setViewingCert(null);
                             updateState({ linkedinUrl: e.target.value });
                           }} 
                           className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500" 
                         />
                       </div>
                    </div>
                    <button onClick={handleDemoFill} className="text-right text-xs text-cardano-accent hover:text-white">Use Demo</button>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center text-red-400 text-sm animate-fade-in">
                    <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" /> {error}
                  </div>
                )}

                <div className="mt-6">
                  <Button onClick={handleAnalyze} className="w-full relative overflow-hidden group" disabled={(!resumeText && !selectedFile) || isAnalyzing} isLoading={isAnalyzing}>
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] animate-[shimmer_1.5s_infinite]"></div>
                    )}
                    {isAnalyzing ? (isGeneratingProof ? 'Generating ZK Proof...' : 'Verifying with Gemini AI...') : 'Analyze & Verify Credential'}
                  </Button>
                </div>
             </div>
             {isAnalyzing && !isGeneratingProof && (
               <div className="absolute top-0 left-0 w-full h-1 bg-cardano-accent shadow-[0_0_20px_#1EC198] animate-[scan_2s_ease-in-out_infinite] opacity-70 pointer-events-none"></div>
             )}
          </div>

          {/* Analysis Results */}
          {result && (
            <div className={`bg-slate-800 rounded-2xl border shadow-xl overflow-hidden animate-fade-in ${result.isDocumentAuthentic ? 'border-slate-700' : 'border-red-500/50'}`}>
              <div className={`p-6 border-b flex justify-between items-center ${result.isDocumentAuthentic ? 'bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700' : 'bg-red-900/30 border-red-500/30'}`}>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {result.isDocumentAuthentic ? <BrainCircuit className="h-5 w-5 text-cardano-accent" /> : <XOctagon className="h-5 w-5 text-red-500" />}
                    {result.isDocumentAuthentic ? 'Verification Results' : 'REJECTED: FAKE DETECTED'}
                  </h3>
                </div>
                <div className={`px-4 py-2 rounded-full border ${result.isDocumentAuthentic ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                   <span className="font-bold">{result.overallAuthenticityScore}% {result.isDocumentAuthentic ? 'Authentic' : 'Authenticity Score'}</span>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div className={`p-4 rounded-xl border ${result.isDocumentAuthentic ? 'bg-emerald-900/10 border-emerald-500/20' : 'bg-red-900/20 border-red-500/40'}`}>
                   <div className="flex items-start gap-3">
                      {result.isDocumentAuthentic ? <Shield className="h-6 w-6 text-emerald-400" /> : <AlertTriangle className="h-6 w-6 text-red-400" />}
                      <div>
                        <h4 className={`text-sm font-bold ${result.isDocumentAuthentic ? 'text-emerald-400' : 'text-red-400'}`}>
                           {result.isDocumentAuthentic ? 'Document Integrity Verified' : 'Integrity Issues - Forgery Suspected'}
                        </h4>
                        <p className={`text-sm mt-1 ${result.isDocumentAuthentic ? 'text-slate-300' : 'text-red-200'}`}>{result.documentForgeryAnalysis}</p>
                      </div>
                   </div>
                </div>
                
                {result.socialIntegrity && (
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                     <h4 className="text-sm uppercase tracking-wide text-slate-500 mb-3 font-semibold flex items-center gap-2">
                       <Link className="w-4 h-4" /> Social Identity Verification
                     </h4>
                     <p className="text-xs text-slate-400">{result.socialIntegrity.analysis}</p>
                  </div>
                )}

                {result.isDocumentAuthentic && result.certifications && result.certifications.length > 0 && (
                   <div className="animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                     <h4 className="text-sm uppercase tracking-wide text-slate-500 mb-3 font-semibold">Verified Certificate Details</h4>
                     <div className="grid gap-4">
                       {result.certifications.map((cert, i) => (
                         <div key={i} className="bg-slate-900 rounded-xl p-5 border border-slate-700 relative overflow-hidden">
                            <h5 className="text-lg font-bold text-white">{cert.name}</h5>
                            <p className="text-cardano-accent text-sm font-medium mb-3">{cert.issuer} • {cert.issueDate}</p>
                            <p className="text-slate-400 text-sm mb-4 leading-relaxed">{cert.description}</p>
                            {cert.credentialId && (
                                 <div className="flex items-center text-xs text-slate-500 bg-black/20 w-fit px-3 py-1.5 rounded-full border border-slate-700">
                                    <Hash className="w-3 h-3 mr-1" /> ID: {cert.credentialId}
                                 </div>
                            )}
                         </div>
                       ))}
                     </div>
                   </div>
                )}

                <div className="flex gap-4 pt-4 border-t border-slate-700 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                   <Button onClick={handleMint} className={`flex-1 ${!result.isDocumentAuthentic ? 'bg-slate-700 cursor-not-allowed text-slate-400' : 'bg-indigo-600 hover:bg-indigo-500'}`} disabled={!result.isDocumentAuthentic}>
                      <Share2 className="w-4 h-4 mr-2" /> {user ? 'Mint Verified NFT' : 'Login to Mint NFT'}
                   </Button>
                   <Button variant="outline" onClick={clearSession}>Close Results</Button>
                </div>
              </div>
            </div>
          )}

          {/* Verified Credentials List - Moved to Bottom Left */}
          <div className={`bg-slate-800 rounded-2xl border border-slate-700 shadow-xl flex flex-col overflow-hidden`}>
              <div className="p-4 border-b border-slate-700 bg-slate-900/30 flex justify-between items-center">
                 <h3 className="font-bold text-white flex items-center text-sm">
                    <Award className="w-4 h-4 text-emerald-400 mr-2" />
                    Verified Credentials Wallet
                 </h3>
                 <span className="text-xs text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">
                    {verifiedCerts.length} Items
                 </span>
              </div>
              
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                 {verifiedCerts.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 col-span-2">
                       <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
                       <p className="text-sm">No verified credentials yet.</p>
                       <p className="text-xs mt-1">Upload and verify a document to add it here.</p>
                    </div>
                 ) : (
                    verifiedCerts.map((cert, idx) => (
                       <div key={idx} className="bg-slate-900 p-3 rounded-xl border border-slate-700 hover:border-cardano-accent/40 transition-colors group flex flex-col justify-between h-full">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                               <div className="flex gap-2">
                                 <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/20 px-1.5 py-0.5 rounded border border-emerald-900/30">REAL</span>
                                 {cert.zkProof && <span className="text-[10px] font-mono text-purple-400 bg-purple-900/20 px-1.5 py-0.5 rounded flex items-center gap-1"><Lock className="w-3 h-3" /> ZK</span>}
                               </div>
                               <div className="flex gap-1">
                                  {cert.socialLinks?.github && (
                                    <a href={cert.socialLinks.github} target="_blank" rel="noopener noreferrer">
                                       <Github className="w-3 h-3 text-slate-500 hover:text-white cursor-pointer" />
                                    </a>
                                  )}
                                  {cert.socialLinks?.linkedin && (
                                    <a href={cert.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                                       <Linkedin className="w-3 h-3 text-slate-500 hover:text-blue-400 cursor-pointer" />
                                    </a>
                                  )}
                               </div>
                            </div>
                            <h4 className="font-bold text-white text-sm mb-1 line-clamp-2" title={cert.name}>{cert.name}</h4>
                            <p className="text-xs text-slate-400 mb-2 truncate">{cert.issuer} • {cert.issueDate}</p>
                            {cert.nftId && (
                                <p className="text-[10px] text-cardano-accent font-mono mb-2">{cert.nftId}</p>
                            )}
                          </div>
                          <div className="flex gap-2 mt-2">
                             <button onClick={() => setViewingCert(cert)} className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] rounded text-slate-300 border border-slate-600 transition-colors">View Proof</button>
                             <button onClick={() => handleShare(cert)} className="flex-1 py-1.5 bg-cardano-accent/10 hover:bg-cardano-accent/20 text-[10px] rounded text-cardano-accent border border-cardano-accent/20 transition-colors">Share</button>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>
        </div>

        {/* Right Column: Identity & Skills Dashboard */}
        <div className="xl:col-span-4 space-y-6">
           
           {/* Verified Credentials List REMOVED FROM HERE */}

           {/* SkillChain Verified Identity Card / Scanner - ONLY SHOW IF ACTIVE DATA EXISTS */}
           {user && activeData && (
             <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-2xl border border-slate-700 shadow-2xl overflow-hidden relative animate-fade-in">
               <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                 <ShieldCheck className="w-32 h-32 text-cardano-accent" />
               </div>
               
               <div className="p-6">
                 <div className="flex items-center gap-2 mb-4">
                   <Shield className="w-4 h-4 text-cardano-accent" />
                   <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">SkillChain Verified Identity</span>
                 </div>
                 
                 <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                 <p className="text-xs font-mono text-blue-400 mb-4 bg-blue-900/10 inline-block px-2 py-1 rounded">DID: 1z2...9x</p>
                 
                 <div className="flex gap-6 mb-6">
                   <div className="bg-white p-2 rounded-lg w-28 h-32 flex flex-col items-center justify-center shrink-0">
                      <div className="w-24 h-24 bg-white relative flex items-center justify-center overflow-hidden">
                           <img 
                             src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&format=svg&color=0033AD&bgcolor=FFFFFF&data=${encodeURIComponent(qrTargetUrl)}`}
                             alt="Scan to view Project"
                             className="w-full h-full object-contain"
                           />
                      </div>
                      <span className="text-[8px] text-slate-900 mt-2 font-bold uppercase tracking-wide text-center leading-tight">
                        Scan for Data
                      </span>
                   </div>
                   
                   <div className="flex-1 space-y-3">
                     <div className="flex gap-2">
                       <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center border border-slate-700">
                          {activeData.socialLinks?.github ? (
                            <a href={activeData.socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full h-full">
                              <Github className="w-4 h-4 text-white" />
                            </a>
                          ) : (
                             <Github className="w-4 h-4 text-slate-600" />
                          )}
                       </div>
                       <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center border border-slate-700">
                          {activeData.socialLinks?.linkedin ? (
                            <a href={activeData.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full h-full">
                              <Linkedin className="w-4 h-4 text-white" />
                            </a>
                          ) : (
                             <Linkedin className="w-4 h-4 text-slate-600" />
                          )}
                       </div>
                     </div>
                     
                     <div className="flex gap-2">
                       <div className="bg-slate-800/80 p-2 rounded border border-slate-700 flex-1">
                          <p className="text-[8px] text-slate-400 uppercase">Trust Score</p>
                          <p className="text-xl font-bold text-cardano-accent">{activeData.score}%</p>
                       </div>
                       <div className="bg-slate-800/80 p-2 rounded border border-slate-700 flex-1">
                          <p className="text-[8px] text-slate-400 uppercase">Top Skill</p>
                          <p className="text-sm font-bold text-white truncate">{topSkills[0]?.skillName || 'N/A'}</p>
                       </div>
                     </div>
                   </div>
                 </div>
                 
                 <div className="flex gap-3">
                   <Button onClick={() => handleShare()} className="flex-1 py-2 text-xs h-auto bg-blue-600 hover:bg-blue-500">
                     <Share2 className="w-3 h-3 mr-2" /> Share Identity
                   </Button>
                   <Button variant="outline" className="flex-1 py-2 text-xs h-auto bg-transparent" onClick={() => navigator.clipboard.writeText("did:cardano:889025946c1e550c")}>
                     <Copy className="w-3 h-3 mr-2" /> Copy DID
                   </Button>
                 </div>
               </div>
             </div>
           )}

           {/* Current Credential Trust Score Card - ONLY SHOW IF ACTIVE DATA EXISTS */}
           {user && activeData && activeData.score > 0 && (
             <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-5 backdrop-blur-sm animate-fade-in">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="font-bold text-white">Current Credential Score</h3>
                   <span className="text-3xl font-bold text-emerald-400">{activeData.score}%</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  Analysis of {activeData.name} by {activeData.issuer}.
                </p>
                <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
                   <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Decentralized Identifier</p>
                   <p className="text-xs font-mono text-blue-400 truncate">DID: 1z2...9x</p>
                   {activeData.nftId && <p className="text-[10px] text-cardano-accent mt-1">NFT ID: {activeData.nftId}</p>}
                </div>
             </div>
           )}

           {/* Top Detected Skills Chart - ONLY SHOW IF ACTIVE DATA EXISTS */}
           {user && activeData && topSkills.length > 0 && (
             <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 shadow-lg animate-fade-in">
                <h3 className="font-bold text-white mb-4">Detected Skills in Resource</h3>
                <div className="space-y-3">
                   {topSkills.map((skill, i) => (
                     <div key={i}>
                       <div className="flex justify-between text-xs mb-1">
                         <span className="text-white font-medium">{skill.skillName}</span>
                       </div>
                       <div className="h-6 w-full bg-slate-700/50 rounded overflow-hidden relative">
                         <div 
                           className="h-full bg-cardano-accent rounded transition-all duration-1000" 
                           style={{ width: `${skill.confidenceScore}%` }}
                         ></div>
                       </div>
                     </div>
                   ))}
                </div>
             </div>
           )}

           {/* Skills Breakdown Accordion - ONLY SHOW IF ACTIVE DATA EXISTS */}
           {user && activeData && activeData.skills.length > 0 && (
             <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 shadow-lg animate-fade-in">
                <div className="flex items-center gap-2 mb-4 text-white font-bold">
                   <div className="w-4 h-4 text-blue-400"><Hash className="w-4 h-4" /></div>
                   <h3>Skills Breakdown</h3>
                </div>
                
                <div className="space-y-2">
                   {Object.entries(groupedSkills).map(([category, skills]) => (
                     <div key={category} className="border border-slate-700 rounded-lg overflow-hidden bg-slate-900/50">
                        <button 
                          onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                          className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-700/50 transition-colors"
                        >
                           <span className="text-sm font-medium text-white flex items-center gap-2">
                             {category} 
                             <span className="bg-slate-700 text-slate-300 text-[10px] px-1.5 py-0.5 rounded-full">{skills.length}</span>
                           </span>
                           {expandedCategory === category ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>
                        
                        {expandedCategory === category && (
                          <div className="p-3 pt-0 border-t border-slate-700/50 bg-slate-800/30">
                             <div className="flex flex-wrap gap-2 mt-2">
                               {skills.map((s, idx) => (
                                 <span key={idx} className="text-xs bg-slate-900 border border-slate-700 text-slate-300 px-2 py-1 rounded">
                                   {s.skillName} <span className="text-emerald-500 text-[10px] ml-1">{s.confidenceScore}%</span>
                                 </span>
                               ))}
                             </div>
                          </div>
                        )}
                     </div>
                   ))}
                </div>
             </div>
           )}
        </div>
      </div>

      {/* Modal for Viewing Certificate */}
      {viewingCert && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setViewingCert(null)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative" onClick={e => e.stopPropagation()}>
             <div className="bg-gradient-to-r from-cardano to-blue-900 p-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-6 opacity-10">
                 <Award className="w-32 h-32 text-white" />
               </div>
               <div className="relative z-10">
                 <h3 className="text-xl font-bold text-white mb-1">{viewingCert.name}</h3>
                 <div className="flex items-center gap-2">
                   <p className="text-blue-200 text-sm">{viewingCert.issuer}</p>
                   <Check className="w-4 h-4 text-emerald-400" />
                 </div>
               </div>
            </div>
            <div className="p-6 space-y-5">
               <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                  <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider block mb-1">Issue Date</label>
                  <p className="text-white font-mono text-sm">{viewingCert.issueDate}</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                  <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider block mb-1">Credential ID</label>
                  <p className="text-white font-mono text-sm truncate" title={viewingCert.credentialId}>{viewingCert.credentialId}</p>
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase text-slate-500 font-bold tracking-wider block mb-2">Description</label>
                <p className="text-slate-300 text-sm leading-relaxed bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                  {viewingCert.description}
                </p>
              </div>
               <div className="pt-2 flex gap-3">
                <Button onClick={() => handleShare(viewingCert)} className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" /> Share Proof
                </Button>
                <Button variant="outline" onClick={() => setViewingCert(null)} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
            <button 
              onClick={() => setViewingCert(null)} 
              className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/20 rounded-full p-1 hover:bg-black/40 transition-all"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
