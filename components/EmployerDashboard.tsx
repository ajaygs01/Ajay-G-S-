
import React, { useState, useMemo } from 'react';
import { Button } from './Button';
import { Search, CheckCircle, User as UserIcon, Code, FileText, AlertCircle, Copy } from 'lucide-react';
import { CertificationDetail, User } from '../types';

interface EmployerDashboardProps {
  verifiedCerts: CertificationDetail[];
  user: User | null;
}

// Mock Database of verified records on the blockchain
const MOCK_RECORDS = [
  {
    nftId: "NFT-8890",
    did: "did:cardano:889025946c1e550c",
    candidateName: "Anil Kumar K R",
    role: "Senior Frontend Developer",
    verificationDate: "2023-10-27",
    confidence: 96,
    skills: [
      { name: "React.js", score: 98 },
      { name: "Blockchain Architecture", score: 95 },
      { name: "Node.js", score: 92 }
    ]
  },
  {
    nftId: "NFT-1024",
    did: "did:cardano:a1b2c3d4e5f6",
    candidateName: "Sarah Jenkins",
    role: "Backend Engineer",
    verificationDate: "2024-01-15",
    confidence: 94,
    skills: [
      { name: "Rust", score: 99 },
      { name: "PostgreSQL", score: 90 },
      { name: "System Design", score: 88 }
    ]
  },
  {
    nftId: "NFT-2048",
    did: "did:cardano:998877665544",
    candidateName: "David Chen",
    role: "AI/ML Specialist",
    verificationDate: "2024-02-10",
    confidence: 98,
    skills: [
      { name: "Python", score: 98 },
      { name: "TensorFlow", score: 96 },
      { name: "Computer Vision", score: 92 }
    ]
  }
];

export const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ verifiedCerts, user }) => {
  const [nftId, setNftId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [record, setRecord] = useState<typeof MOCK_RECORDS[0] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Merge static mock records with live verified certificates from the current session
  const allRecords = useMemo(() => {
    const liveRecords = verifiedCerts
      .filter(cert => cert.nftId) // Only those with an NFT ID
      .map(cert => ({
        nftId: cert.nftId!,
        did: "did:cardano:889025946c1e550c", // Using the session DID
        candidateName: user?.name || "Guest Candidate",
        role: cert.name, // Using cert name as the role/title
        verificationDate: new Date().toISOString().split('T')[0],
        confidence: cert.score || 90,
        skills: cert.skills ? cert.skills.map(s => ({ name: s.skillName, score: s.confidenceScore })) : []
      }));
    
    return [...MOCK_RECORDS, ...liveRecords];
  }, [verifiedCerts, user]);

  const handleVerify = () => {
    if (!nftId.trim()) return;
    setIsSearching(true);
    setError(null);
    setRecord(null);
    
    // Simulate network latency
    setTimeout(() => {
      const searchTerm = nftId.trim();
      const found = allRecords.find(r => 
        r.nftId.toLowerCase() === searchTerm.toLowerCase() || 
        r.did.toLowerCase() === searchTerm.toLowerCase()
      );

      if (found) {
        setRecord(found);
      } else {
        setError(`No verified record found for ID: ${searchTerm}`);
      }
      setIsSearching(false);
    }, 1000);
  };

  const fillDemoId = (id: string) => {
    setNftId(id);
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold text-white">Employer Verification Dashboard</h2>
        <p className="mt-2 text-slate-400">Instantly verify candidate authenticity by scanning their Skill NFT ID or DID.</p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Search Bar */}
        <div className="bg-slate-800 p-2 rounded-2xl flex items-center shadow-lg border border-slate-700 mb-6 relative z-10">
          <Search className="h-6 w-6 text-slate-500 ml-4" />
          <input 
            type="text" 
            placeholder="Enter NFT ID (e.g., NFT-8890) or DID..." 
            className="bg-transparent border-none text-white px-4 py-3 flex-grow focus:ring-0 outline-none placeholder-slate-500 w-full"
            value={nftId}
            onChange={(e) => setNftId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
          />
          <Button onClick={handleVerify} isLoading={isSearching}>
            Verify
          </Button>
        </div>

        {/* Demo Helper - Useful for Hackathon Demo */}
        <div className="flex justify-center gap-3 mb-12 flex-wrap">
          <span className="text-xs text-slate-500 py-1">Try these IDs:</span>
          {allRecords.slice(0, 5).map(r => (
            <button 
              key={r.nftId}
              onClick={() => fillDemoId(r.nftId)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-cardano-accent px-3 py-1 rounded-full border border-slate-700 transition-colors"
            >
              {r.nftId} ({r.candidateName.split(' ')[0]})
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center animate-fade-in mb-8">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-red-400 font-bold text-lg">Verification Failed</h3>
            <p className="text-red-300/70 mt-1">{error}</p>
            <p className="text-xs text-slate-500 mt-4">Ensure the candidate has shared the correct NFT ID or Decentralized Identifier.</p>
          </div>
        )}

        {/* Record Display */}
        {record && (
          <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 animate-fade-in shadow-2xl relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <CheckCircle className="w-40 h-40 text-emerald-400" />
            </div>

            {/* Header */}
            <div className="bg-gradient-to-r from-cardano-dark to-slate-900 p-6 flex justify-between items-center relative z-10">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-slate-700 rounded-full flex items-center justify-center border-2 border-cardano-accent shadow-lg overflow-hidden">
                   {/* Avatar Placeholder */}
                   <UserIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{record.candidateName}</h3>
                  <p className="text-slate-300 text-sm">{record.role}</p>
                  <p className="text-cardano-accent text-xs flex items-center gap-1 mt-1">
                    <CheckCircle className="h-3 w-3" /> Identity Verified
                  </p>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs text-slate-400">NFT ID</p>
                <p className="font-mono text-lg font-bold text-white tracking-wider">{record.nftId}</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 relative z-10">
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-900 p-4 rounded-lg text-center border border-slate-700/50">
                  <p className="text-3xl font-bold text-emerald-400">{record.confidence}%</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1 font-semibold">Trust Score</p>
                </div>
                <div className="bg-slate-900 p-4 rounded-lg text-center border border-slate-700/50">
                  <p className="text-3xl font-bold text-white">{record.skills.length}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1 font-semibold">Verified Skills</p>
                </div>
                <div className="bg-slate-900 p-4 rounded-lg text-center border border-slate-700/50 relative group cursor-pointer" onClick={() => navigator.clipboard.writeText(record.did)}>
                  <p className="text-3xl font-bold text-blue-400">DID</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1 font-semibold">Identity Secured</p>
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                     <span className="text-xs text-white flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</span>
                  </div>
                </div>
              </div>

              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">Verified Skill Set</h4>
              <div className="space-y-4">
                {record.skills.map((skill: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="bg-slate-700/50 p-1.5 rounded text-cardano-accent">
                        <Code className="h-4 w-4" />
                      </div>
                      <span className="text-white font-medium">{skill.name}</span>
                    </div>
                    <div className="flex items-center gap-3 w-1/2 justify-end">
                       <span className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">{skill.score}% Expert</span>
                       <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cardano to-cardano-accent" 
                          style={{ width: `${skill.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-slate-900/80 p-4 text-center border-t border-slate-700 backdrop-blur-sm">
               <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
                 <FileText className="h-3 w-3" />
                 Minted on Cardano Blockchain • Block #849201 • {record.verificationDate}
               </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
