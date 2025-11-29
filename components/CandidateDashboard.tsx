
import React, { useMemo, useState } from 'react';
import { User, CertificationDetail } from '../types';
import { Award, ShieldCheck, TrendingUp, Lock, Share2, Search, QrCode, X, Hash, Github, Linkedin, Calendar, CheckCircle } from 'lucide-react';
import { Button } from './Button';

interface CandidateDashboardProps {
  user: User;
  verifiedCerts: CertificationDetail[];
}

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({ user, verifiedCerts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<CertificationDetail[] | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const trustScore = useMemo(() => {
    if (verifiedCerts.length === 0) return 0;
    const total = verifiedCerts.reduce((acc, cert) => acc + (cert.score || 0), 0);
    return Math.round(total / verifiedCerts.length);
  }, [verifiedCerts]);

  const socialVerifiedCount = useMemo(() => {
    return verifiedCerts.filter(c => c.socialLinks?.github || c.socialLinks?.linkedin).length;
  }, [verifiedCerts]);

  const handleShare = async (cert: CertificationDetail) => {
    const shareText = `✅ VERIFIED CREDENTIAL

Candidate: ${user.name}
Certification: ${cert.name}
Issuer: ${cert.issuer}
Date: ${cert.issueDate}
Credential ID: ${cert.credentialId || 'N/A'}
NFT ID: ${cert.nftId || 'Pending'}
Trust Score: ${cert.score || 0}%

Verified on SkillChain`;

    if (navigator.share && navigator.canShare && navigator.canShare({ text: shareText })) {
      try {
        await navigator.share({
          text: shareText
        });
      } catch (err) {
        console.log("Share failed or cancelled, falling back to clipboard");
        navigator.clipboard.writeText(shareText);
        alert("Verification details copied to clipboard!");
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Verification details copied to clipboard!");
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults(null);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    const results = verifiedCerts.filter(cert => {
      // Check Candidate Name (User), Credential ID, DID (Mocked), NFT ID, or Cert Name
      const matchesName = user.name.toLowerCase().includes(term);
      const matchesCertName = cert.name.toLowerCase().includes(term);
      const matchesIssuer = cert.issuer.toLowerCase().includes(term);
      const matchesId = cert.credentialId?.toLowerCase().includes(term);
      const matchesNFT = cert.nftId?.toLowerCase().includes(term);
      const matchesDID = term.includes('did:cardano'); // Simple check if searching by DID

      return matchesName || matchesCertName || matchesIssuer || matchesId || matchesNFT || matchesDID;
    });

    setSearchResults(results);
  };

  const handleScan = () => {
    // Open visual scanner
    setIsScanning(true);
    setSearchResults(null);
    
    // Simulate scanning process
    setTimeout(() => {
      // If user has verified certs, simulate scanning the first one's NFT ID, otherwise default to demo ID
      let scannedValue = "NFT-8890";
      
      if (verifiedCerts.length > 0 && verifiedCerts[0].nftId) {
         scannedValue = verifiedCerts[0].nftId;
      }

      setSearchTerm(scannedValue);
      setIsScanning(false);
      
      // Auto-trigger search after scan
      setTimeout(() => {
        // Need to duplicate logic here because state update isn't immediate in same cycle
        const term = scannedValue.toLowerCase();
        const results = verifiedCerts.filter(cert => {
          const matchesName = user.name.toLowerCase().includes(term);
          const matchesCertName = cert.name.toLowerCase().includes(term);
          const matchesIssuer = cert.issuer.toLowerCase().includes(term);
          const matchesId = cert.credentialId?.toLowerCase().includes(term);
          const matchesNFT = cert.nftId?.toLowerCase().includes(term);
          return matchesName || matchesCertName || matchesIssuer || matchesId || matchesNFT;
        });
        setSearchResults(results);
      }, 100);
    }, 2500);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Search Section */}
      <div className="mb-10 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl relative">
        <h2 className="text-xl font-bold text-white mb-4">Search Candidates & Resources</h2>
        <div className="flex flex-col md:flex-row gap-4">
           <div className="relative flex-grow">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
             <input 
               type="text" 
               placeholder="Search by Name, DID, NFT ID or Credential ID..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
               className="w-full bg-slate-900 border border-slate-600 rounded-xl py-3 pl-12 pr-12 text-white placeholder-slate-500 focus:ring-2 focus:ring-cardano-accent focus:border-transparent outline-none transition-all"
             />
             {searchTerm && (
               <button onClick={clearSearch} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                 <X className="h-5 w-5" />
               </button>
             )}
           </div>
           <Button onClick={handleSearch} className="md:w-32">Search</Button>
           <Button variant="outline" onClick={handleScan} className="md:w-auto" title="Scan QR Code">
             <QrCode className="h-5 w-5 mr-2" /> Scanner
           </Button>
        </div>

        {/* Search Results Display */}
        {searchResults !== null && (
          <div className="mt-6 animate-fade-in">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-white font-semibold flex items-center gap-2">
                 <CheckCircle className="h-5 w-5 text-cardano-accent" />
                 Search Results ({searchResults.length})
               </h3>
             </div>
             
             {searchResults.length === 0 ? (
               <div className="bg-slate-900/50 p-8 rounded-xl text-center border border-slate-700 border-dashed">
                 <p className="text-slate-400">No resources found matching "{searchTerm}".</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {searchResults.map((cert, idx) => (
                   <div key={idx} className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                         <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 hidden sm:block">
                            <ShieldCheck className="h-8 w-8 text-emerald-400" />
                         </div>
                         <div>
                            <h4 className="text-lg font-bold text-white">{cert.name}</h4>
                            <p className="text-sm text-cardano-accent">{cert.issuer}</p>
                            <p className="text-xs text-slate-400 mt-1">
                               Candidate: <span className="text-white font-medium">{user.name}</span> • DID: did:cardano:889...
                            </p>
                            <div className="flex gap-2 mt-2">
                               {cert.credentialId && (
                                 <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 border border-slate-700">ID: {cert.credentialId}</span>
                               )}
                               {cert.nftId && (
                                 <span className="text-[10px] bg-indigo-900/20 px-2 py-0.5 rounded text-indigo-400 border border-indigo-900/30">NFT: {cert.nftId}</span>
                               )}
                               <span className="text-[10px] bg-emerald-900/20 px-2 py-0.5 rounded text-emerald-400 border border-emerald-900/30">Score: {cert.score}%</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <Button onClick={() => handleShare(cert)} className="text-xs px-4 py-2 h-auto">
                            <Share2 className="h-4 w-4 mr-2" /> Share
                         </Button>
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}
      </div>

      {/* Scanner Modal */}
      {isScanning && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-fade-in">
           <div className="w-full max-w-sm bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden relative shadow-2xl">
              <div className="aspect-[3/4] bg-black relative">
                 {/* Camera Viewfinder UI */}
                 <div className="absolute inset-0 opacity-50 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
                 
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-cardano-accent/50 rounded-lg relative">
                       {/* Corners */}
                       <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-cardano-accent -mt-1 -ml-1"></div>
                       <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-cardano-accent -mt-1 -mr-1"></div>
                       <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-cardano-accent -mb-1 -ml-1"></div>
                       <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-cardano-accent -mb-1 -mr-1"></div>
                       
                       {/* Scanning Line */}
                       <div className="absolute top-0 left-0 w-full h-1 bg-cardano-accent shadow-[0_0_15px_#1EC198] animate-[scan_2s_ease-in-out_infinite]"></div>
                    </div>
                 </div>
                 
                 <div className="absolute bottom-8 left-0 w-full text-center">
                    <p className="text-white font-mono text-sm bg-black/50 inline-block px-3 py-1 rounded">Scanning NFT ID...</p>
                 </div>
              </div>
              <div className="p-4 bg-slate-800 border-t border-slate-700 flex justify-between items-center">
                 <p className="text-slate-400 text-xs">Point camera at a SkillChain QR</p>
                 <Button variant="danger" className="py-1 px-4 text-xs h-auto" onClick={() => setIsScanning(false)}>Cancel</Button>
              </div>
           </div>
        </div>
      )}

      <div className="mb-12">
         <h1 className="text-3xl font-bold text-white mb-2">My Verified Dashboard</h1>
         <p className="text-slate-400">Manage your blockchain-verified credentials and decentralized identity.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
         <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-emerald-500/10 rounded-lg">
                 <Award className="w-6 h-6 text-emerald-400" />
               </div>
               <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">+2 this week</span>
            </div>
            <h3 className="text-2xl font-bold text-white">{verifiedCerts.length}</h3>
            <p className="text-sm text-slate-400">Total Credentials</p>
         </div>

         <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-cardano-accent/10 rounded-lg">
                 <ShieldCheck className="w-6 h-6 text-cardano-accent" />
               </div>
               <span className="text-xs text-cardano-accent bg-cardano-accent/10 px-2 py-1 rounded">Top 5%</span>
            </div>
            <h3 className="text-2xl font-bold text-white">{trustScore}%</h3>
            <p className="text-sm text-slate-400">Avg. Trust Score</p>
         </div>

         <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-blue-500/10 rounded-lg">
                 <TrendingUp className="w-6 h-6 text-blue-400" />
               </div>
            </div>
            <h3 className="text-2xl font-bold text-white">{verifiedCerts.length * 3}</h3>
            <p className="text-sm text-slate-400">Verified Skills Detected</p>
         </div>
         
         <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-purple-500/10 rounded-lg">
                 <Lock className="w-6 h-6 text-purple-400" />
               </div>
            </div>
            <h3 className="text-2xl font-bold text-white">{socialVerifiedCount}</h3>
            <p className="text-sm text-slate-400">Social Identities Linked</p>
         </div>
      </div>

      <h2 className="text-xl font-bold text-white mb-6">Verified Credential Repository</h2>
      
      {verifiedCerts.length === 0 ? (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 border-dashed p-12 text-center">
           <Award className="w-16 h-16 text-slate-600 mx-auto mb-4" />
           <h3 className="text-lg font-medium text-white mb-2">No Credentials Minted Yet</h3>
           <p className="text-slate-400 mb-6 max-w-md mx-auto">Go to the "For Candidates" page to upload your resume or certificates and verify them with AI.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {verifiedCerts.map((cert, idx) => (
             <div key={idx} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-cardano-accent/50 transition-colors group">
                <div className="h-2 bg-gradient-to-r from-cardano to-cardano-accent"></div>
                <div className="p-6">
                   <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono text-slate-500 mb-1">{cert.issueDate}</span>
                        <h3 className="text-lg font-bold text-white group-hover:text-cardano-accent transition-colors">{cert.name}</h3>
                      </div>
                      <div className="bg-slate-900 rounded-lg p-2 border border-slate-700">
                         <ShieldCheck className="w-6 h-6 text-emerald-400" />
                      </div>
                   </div>
                   
                   <p className="text-sm text-slate-300 mb-4">{cert.issuer}</p>
                   
                   {cert.credentialId && (
                     <div className="flex items-center text-xs text-slate-500 bg-slate-900 w-fit px-2 py-1 rounded mb-4">
                       <Hash className="w-3 h-3 mr-1" /> {cert.credentialId}
                     </div>
                   )}
                   {cert.nftId && (
                     <div className="flex items-center text-xs text-indigo-400 bg-indigo-900/10 w-fit px-2 py-1 rounded mb-4 border border-indigo-900/30">
                       <span className="font-bold mr-1">NFT:</span> {cert.nftId}
                     </div>
                   )}
                   
                   <div className="flex items-center gap-3 pt-4 border-t border-slate-700">
                      {cert.socialLinks?.github && (
                        <a href={cert.socialLinks.github} target="_blank" rel="noopener noreferrer">
                          <Github className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer" />
                        </a>
                      )}
                      {cert.socialLinks?.linkedin && (
                        <a href={cert.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="w-4 h-4 text-slate-400 hover:text-blue-400 cursor-pointer" />
                        </a>
                      )}
                      {cert.zkProof && (
                        <div className="ml-auto flex items-center text-[10px] text-purple-400 bg-purple-900/20 px-2 py-1 rounded">
                           <Lock className="w-3 h-3 mr-1" /> ZK Secured
                        </div>
                      )}
                   </div>
                   
                   <div className="mt-4 pt-2">
                     <Button variant="outline" className="w-full text-xs py-2 h-auto" onClick={() => handleShare(cert)}>
                       <Share2 className="w-3 h-3 mr-2" /> Share Credential
                     </Button>
                   </div>
                </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
};
