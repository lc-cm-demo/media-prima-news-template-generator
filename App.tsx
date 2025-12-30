import React, { useState, useRef } from 'react';
import { NEWS_TEMPLATES } from './constants';
import { AppStep, GeneratedAsset } from './types';
import { generateCaption, generateAssetWithTemplate } from './services/geminiService';
import { AssetCard } from './components/AssetCard';

// Icons
const UploadIcon = () => (
  <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
);

const App: React.FC = () => {
  // State
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.UPLOAD);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [userContext, setUserContext] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [isCaptioning, setIsCaptioning] = useState<boolean>(false);
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Clean the base64 string for the API (remove data URL prefix if needed, though SDK often handles it)
        // For SDK usage, it usually wants just the base64 data depending on helper, 
        // but passing the full string to our service helper where we split it is safer.
        const cleanBase64 = base64String.split(',')[1]; 
        setSourceImage(cleanBase64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateCaption = async () => {
    if (!sourceImage) return;
    
    setIsCaptioning(true);
    try {
      const result = await generateCaption(sourceImage, userContext);
      setCaption(result);
      setCurrentStep(AppStep.CAPTION_REVIEW);
    } catch (e) {
      alert("Failed to generate caption. Please check API Key.");
    } finally {
      setIsCaptioning(false);
    }
  };

  const startAssetGeneration = () => {
    setCurrentStep(AppStep.GENERATION);
    
    // Initialize placeholders
    const initialAssets: GeneratedAsset[] = NEWS_TEMPLATES.map(t => ({
      templateId: t.id,
      templateName: t.name,
      imageUrl: '',
      status: 'generating'
    }));
    setGeneratedAssets(initialAssets);

    // Trigger parallel generation (Simulating the for loop)
    NEWS_TEMPLATES.forEach(async (template) => {
      try {
        if (!sourceImage) return;
        
        const imageUrl = await generateAssetWithTemplate(sourceImage, caption, template);
        
        setGeneratedAssets(prev => prev.map(a => 
          a.templateId === template.id 
            ? { ...a, imageUrl, status: 'completed' } 
            : a
        ));
      } catch (err) {
         setGeneratedAssets(prev => prev.map(a => 
          a.templateId === template.id 
            ? { ...a, status: 'failed' } 
            : a
        ));
      }
    });
  };

  const resetApp = () => {
    setSourceImage(null);
    setCaption('');
    setUserContext('');
    setGeneratedAssets([]);
    setCurrentStep(AppStep.UPLOAD);
  };

  // Render Helpers
  const renderProgressBar = () => {
    const steps = [
      { id: AppStep.UPLOAD, label: 'Upload & Brief' },
      { id: AppStep.CAPTION_REVIEW, label: 'Review Caption' },
      { id: AppStep.GENERATION, label: 'Generate Assets' },
    ];
    
    // Map current step to an index for progress calculation
    const stepOrder = [AppStep.UPLOAD, AppStep.CAPTION_REVIEW, AppStep.GENERATION, AppStep.RESULTS];
    const currentIndex = stepOrder.indexOf(currentStep);

    return (
      <div className="w-full max-w-3xl mx-auto mb-8">
        <div className="flex justify-between relative">
           <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 -translate-y-1/2 rounded-full"></div>
           {steps.map((s, idx) => {
             const isActive = currentIndex >= idx;
             return (
               <div key={s.id} className="flex flex-col items-center bg-transparent">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300 ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {idx + 1}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${isActive ? 'text-blue-700' : 'text-slate-400'}`}>{s.label}</span>
               </div>
             )
           })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
            <h1 className="text-xl font-semibold tracking-tight">MediaGen<span className="text-blue-600">.ai</span></h1>
          </div>
          {currentStep !== AppStep.UPLOAD && (
             <button onClick={resetApp} className="text-sm text-slate-500 hover:text-slate-800">
               New Project
             </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {renderProgressBar()}

        {/* Step 1: Upload */}
        {currentStep === AppStep.UPLOAD && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-2xl font-bold mb-2">1. Upload Source Content</h2>
              <p className="text-slate-500 mb-6">Upload the raw photo from the field. We'll handle the rest.</p>
              
              <div 
                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${sourceImage ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:bg-slate-50'}`}
                onClick={() => fileInputRef.current?.click()}
              >
                {sourceImage ? (
                  <div className="relative w-full h-full p-2">
                     <img src={`data:image/png;base64,${sourceImage}`} className="w-full h-full object-contain rounded-lg" alt="Preview" />
                     <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                       <span className="text-white font-medium">Click to change</span>
                     </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadIcon />
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileUpload} 
                />
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold mb-4">Context & Instructions</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">What is happening in this image?</label>
                  <textarea 
                    rows={3} 
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    placeholder="e.g., Gig workers gathered in the park discussing new insurance policy..."
                    value={userContext}
                    onChange={(e) => setUserContext(e.target.value)}
                  />
                </div>
                
                <button 
                  disabled={!sourceImage || !userContext || isCaptioning}
                  onClick={handleGenerateCaption}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-white shadow-lg transition-all transform active:scale-[0.98]
                    ${(!sourceImage || !userContext || isCaptioning) ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30'}
                  `}
                >
                  {isCaptioning ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Generating Caption...
                    </span>
                  ) : "Next: Generate Caption"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Caption Review */}
        {currentStep === AppStep.CAPTION_REVIEW && (
          <div className="max-w-2xl mx-auto">
             <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-2xl font-bold">2. Review Caption</h2>
                 <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wide">Gemini Generated</span>
               </div>

               <div className="flex gap-6 mb-8">
                  <div className="w-1/3 shrink-0">
                    <img src={`data:image/png;base64,${sourceImage}`} className="w-full h-32 object-cover rounded-lg shadow-sm" alt="Thumbnail" />
                  </div>
                  <div className="w-full">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Caption</label>
                    <textarea 
                      rows={3}
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg font-medium text-slate-900"
                    />
                    <p className="text-xs text-slate-500 mt-2 text-right">{caption.length} chars</p>
                  </div>
               </div>

               <div className="flex gap-4">
                  <button 
                    onClick={() => setCurrentStep(AppStep.UPLOAD)}
                    className="flex-1 py-3 px-4 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Back
                  </button>
                  <button 
                    onClick={startAssetGeneration}
                    className="flex-[2] py-3 px-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 transition-all"
                  >
                    Generate Assets for All Channels
                  </button>
               </div>
             </div>
          </div>
        )}

        {/* Step 3: Generation & Results */}
        {(currentStep === AppStep.GENERATION || currentStep === AppStep.RESULTS) && (
           <div className="space-y-8">
             <div className="text-center max-w-2xl mx-auto">
               <h2 className="text-3xl font-bold mb-2">Asset Generation</h2>
               <p className="text-slate-500">
                 Generating localized assets for {NEWS_TEMPLATES.length} different outlets. 
                 <br />
                 Images are being composited in real-time.
               </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {generatedAssets.map((asset) => (
                 <AssetCard key={asset.templateId} asset={asset} />
               ))}
             </div>

             {/* Only show "Done" actions if everything is finished */}
             {generatedAssets.every(a => a.status === 'completed' || a.status === 'failed') && (
                <div className="flex justify-center pt-8">
                   <button 
                    onClick={resetApp}
                    className="flex items-center gap-2 py-3 px-6 rounded-full font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-xl transition-all"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                     Create New Post
                   </button>
                </div>
             )}
           </div>
        )}
      </main>
    </div>
  );
};

export default App;