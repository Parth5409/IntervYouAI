import React from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const SocialSharing = ({ sessionData, achievements }) => {
  const overallScore = sessionData?.overall_score || 0;
  const companyName = sessionData?.context?.company_name || 'General';

  const shareText = `I just completed an AI-powered interview simulation for ${companyName} on IntervYou.AI! Got a readiness score of ${overallScore}%.`;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Simulation link secured to clipboard');
  };

  const handleShare = (platform) => {
    let url = '';
    const shareUrl = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(shareText);

    switch (platform) {
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`;
        break;
      default:
        return;
    }
    window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <div className="bg-surface-container-high/40 backdrop-blur-3xl border border-outline-variant/10 p-10 rounded-[3rem] relative overflow-hidden group shadow-xl">
       <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-sky-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-sky-500/10 transition-all duration-1000" />
       
       <div className="space-y-8 relative z-10">
         <div className="space-y-3">
           <h4 className="text-[11px] font-extrabold text-sky-500 uppercase tracking-[0.4em] flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-sky-500" />
             Broadcast Presence
           </h4>
           <p className="text-sm font-body text-on-surface-variant leading-relaxed">
             Export your mission results to the professional network.
           </p>
         </div>

         {achievements && (
           <div className="bg-primary/10 border border-primary/20 p-5 rounded-[1.5rem] flex items-center gap-5 group/achieve animate-pulse">
             <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0 shadow-sm">
               <Icon name="ms:workspace_premium" size={20} />
             </div>
             <p className="text-[10px] font-extrabold text-primary uppercase tracking-widest leading-none">
               High-Performance Achievement Unlocked
             </p>
           </div>
         )}

         <div className="grid grid-cols-2 gap-4">
           <Button
             onClick={() => handleShare('linkedin')}
             variant="secondary"
             className="h-12 border-outline-variant/10 hover:border-sky-500/30 hover:bg-sky-500/5 text-[10px] font-extrabold uppercase tracking-widest gap-2"
           >
             <Icon name="ms:share" size={16} />
             LinkedIn
           </Button>
           <Button
             onClick={() => handleShare('twitter')}
             variant="secondary"
             className="h-12 border-outline-variant/10 hover:border-white/20 hover:bg-white/5 text-[10px] font-extrabold uppercase tracking-widest gap-2"
           >
             <Icon name="ms:public" size={16} />
             Twitter
           </Button>
         </div>

         <button
            onClick={handleCopyLink}
            className="w-full h-12 flex items-center justify-center gap-3 text-[10px] font-extrabold text-on-surface-variant/40 hover:text-on-surface uppercase tracking-[0.2em] border border-dashed border-outline-variant/20 rounded-2xl transition-all hover:border-primary/40 group/copy"
         >
            <Icon name="ms:content_copy" size={16} className="group-hover/copy:scale-110 transition-transform" />
            Secure Access Link
         </button>
       </div>
    </div>
  );
};

export default SocialSharing;