export interface NewsTemplate {
  id: string;
  name: string;
  description: string;
  customImageBase64?: string;
  layoutConfig: {
    primaryColor: string;
    secondaryColor: string;
    overlayStyle: 'bottom-banner' | 'modern-gradient' | 'pop-frame';
    fontStyle: string;
  };
}

export interface GeneratedAsset {
  templateId: string;
  templateName: string;
  imageUrl: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
}

export enum AppStep {
  UPLOAD = 'UPLOAD',
  CAPTION_REVIEW = 'CAPTION_REVIEW',
  GENERATION = 'GENERATION',
  RESULTS = 'RESULTS'
}