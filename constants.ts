import { NewsTemplate } from './types';

const TEMPLATE_FILES = [
  { file: 'Berita_Harian.png', name: 'Berita Harian' },
  { file: 'FMT.png', name: 'FMT' },
  { file: 'FlyFM.png', name: 'FlyFM' },
  { file: 'Harian_Metro.png', name: 'Harian Metro' },
  { file: 'IGN_SEA.png', name: 'IGN SEA' },
  { file: 'JUICE.png', name: 'JUICE' },
  { file: 'Mashable.png', name: 'Mashable' },
  { file: 'MyGameOn.png', name: 'MyGameOn' },
  { file: 'NST_1.png', name: 'NST 1' },
  { file: 'NST_2.png', name: 'NST 2' },
  { file: 'OhBulan_1.png', name: 'OhBulan 1' },
  { file: 'Seismik.png', name: 'Seismik' },
  { file: 'Sirap_Limau_2.png', name: 'Sirap Limau 2' },
  { file: 'Vocket.png', name: 'Vocket' },
  { file: 'XTRA.png', name: 'XTRA' }
];

export const NEWS_TEMPLATES: NewsTemplate[] = TEMPLATE_FILES.map((entry) => {
  const baseName = entry.file.replace(/\.png$/i, '');
  return {
    id: baseName.toLowerCase().replace(/_/g, '-'),
    name: entry.name,
    description: `Template for ${entry.name}.`,
    templateImageUrl: new URL(`./template_image/${entry.file}`, import.meta.url).href
  };
});
