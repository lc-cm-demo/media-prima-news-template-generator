import React, { useEffect, useState } from 'react';
import { GeneratedAsset } from '../types';
import { NEWS_TEMPLATES } from '../constants';
import { getTemplateReferenceImage } from '../services/templateUtils';

interface AssetCardProps {
  asset: GeneratedAsset;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset }) => {
  const [templatePreview, setTemplatePreview] = useState<string>('');
  const template = NEWS_TEMPLATES.find(t => t.id === asset.templateId);

  useEffect(() => {
    if (template) {
      getTemplateReferenceImage(template).then(setTemplatePreview);
    }
  }, [template]);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200 flex flex-col h-full group">
      <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
            {templatePreview && (
                <div className="w-6 h-6 rounded border border-slate-200 overflow-hidden" title="Template Reference">
                    <img src={templatePreview} className="w-full h-full object-cover opacity-80" alt="ref" />
                </div>
            )}
            <span className="font-semibold text-sm text-slate-700">{asset.templateName}</span>
        </div>
        {asset.status === 'completed' && (
           <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Ready</span>
        )}
        {asset.status === 'failed' && (
           <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">Failed</span>
        )}
        {asset.status === 'generating' && (
           <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full animate-pulse">Processing</span>
        )}
      </div>
      
      <div className="flex-grow bg-slate-100 relative min-h-[250px] flex items-center justify-center overflow-hidden">
        {asset.status === 'completed' ? (
          <img 
            src={asset.imageUrl} 
            alt={`Generated for ${asset.templateName}`} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : asset.status === 'generating' ? (
          <div className="flex flex-col items-center p-6 text-center w-full">
             <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
             <p className="text-sm font-medium text-slate-700">Compositing Image</p>
             <p className="text-xs text-slate-500 mt-1">Applying {template?.layoutConfig.overlayStyle}...</p>
          </div>
        ) : (
           <div className="p-4 text-center opacity-50">
             <div className="w-12 h-12 mx-auto bg-slate-200 rounded-full mb-3 flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
             </div>
             <p className="text-sm text-slate-400">Waiting to start</p>
           </div>
        )}
      </div>

      {asset.status === 'completed' && (
        <div className="p-3 bg-white border-t border-slate-100">
          <a 
            href={asset.imageUrl} 
            download={`news-asset-${asset.templateId}.png`}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Download
          </a>
        </div>
      )}
    </div>
  );
};