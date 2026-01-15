import React, { useEffect, useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { GeneratedAsset } from '../types';
import { NEWS_TEMPLATES } from '../constants';
import { getTemplateReferenceImage } from '../services/templateUtils';

interface AssetCardProps {
  asset: GeneratedAsset;
  onRetry?: (templateId: string) => void;
  onView?: (imageUrl: string, templateName: string) => void;
  onEdit?: (templateId: string, comment: string) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset, onRetry, onView, onEdit }) => {
  const [templatePreview, setTemplatePreview] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [editComment, setEditComment] = useState('');
  const template = NEWS_TEMPLATES.find(t => t.id === asset.templateId);

  useEffect(() => {
    if (template) {
      getTemplateReferenceImage(template).then(setTemplatePreview);
    }
  }, [template]);

  const canEdit = asset.status === 'completed' && Boolean(onEdit);

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
          <>
            <img 
              src={asset.imageUrl} 
              alt={`Generated for ${asset.templateName}`} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {onView && (
              <button
                onClick={() => onView(asset.imageUrl, asset.templateName)}
                className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white text-slate-900 p-2 rounded-full shadow"
                title="View larger"
              >
                <ZoomInIcon fontSize="small" />
              </button>
            )}
            {canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="absolute top-3 right-12 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white text-slate-900 p-2 rounded-full shadow"
                title="Edit with comment"
              >
                <EditIcon fontSize="small" />
              </button>
            )}
          </>
        ) : asset.status === 'generating' ? (
          <div className="flex flex-col items-center p-6 text-center w-full">
             <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
             </div>
             <p className="text-sm font-medium text-slate-700">Compositing Image</p>
             <p className="text-xs text-slate-500 mt-1">Applying {template?.name ?? 'template'}...</p>
          </div>
        ) : (
           <div className="p-4 text-center opacity-50">
             <div className="w-12 h-12 mx-auto bg-slate-200 rounded-full mb-3 flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
             </div>
             <p className="text-sm text-slate-400">Waiting to start</p>
           </div>
        )}

        {onRetry && asset.status !== 'generating' && (
          <button
            onClick={() => onRetry(asset.templateId)}
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 hover:bg-slate-900 text-white p-2 rounded-full"
            title="Regenerate this asset"
          >
            <RefreshIcon fontSize="small" />
          </button>
        )}
      </div>

      {canEdit && isEditing && (
        <div className="p-3 bg-white border-t border-slate-100 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Edit note for Gen AI</label>
            <textarea
              rows={3}
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              placeholder="e.g., Make the headline shorter and move emphasis to the right"
              className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              autoFocus
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!onEdit) return;
                const trimmed = editComment.trim();
                if (!trimmed) return;
                onEdit(asset.templateId, trimmed);
                setIsEditing(false);
                setEditComment('');
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold text-white transition-colors ${
                editComment.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-300 cursor-not-allowed'
              }`}
              disabled={!editComment.trim()}
            >
              Apply edit
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditComment('');
              }}
              className="py-2 px-3 rounded-lg text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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

      {asset.status === 'failed' && (
        <div className="p-3 bg-white border-t border-slate-100 text-center text-xs font-medium text-red-600">
          Generation failed. Hover the card to rerun.
        </div>
      )}
    </div>
  );
};
