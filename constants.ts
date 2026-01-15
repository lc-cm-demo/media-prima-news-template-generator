import { NewsTemplate } from './types';

type TemplateFileEntry = {
  file?: string | null;
  name: string;
  id?: string;
};

const TEMPLATE_FILES: TemplateFileEntry[] = [
  { file: 'Berita Harian 1.png', name: 'Berita Harian 1' },
  { file: 'Berita Harian 2.png', name: 'Berita Harian 2' },
  { file: 'Buletin TV3.png', name: 'Buletin TV3' },
  { file: 'FMT 1.png', name: 'FMT 1' },
  { file: 'FMT 2.png', name: 'FMT 2' },
  { file: 'FlyFM.png', name: 'FlyFM' },
  { file: 'Harian Metro.png', name: 'Harian Metro' },
  { file: 'IGN SEA.png', name: 'IGN SEA' },
  { file: 'JUICE.png', name: 'JUICE' },
  { file: 'Mashable 1.png', name: 'Mashable 1' },
  { file: 'Mashable 2.png', name: 'Mashable 2' },
  { file: 'MyGameOn 1.png', name: 'MyGameOn 1' },
  { file: 'MyGameOn 2.png', name: 'MyGameOn 2' },
  { file: 'MyResipi.png', name: 'MyResipi' },
  { file: 'NST 1.png', name: 'NST 1' },
  { file: 'NST 2.png', name: 'NST 2' },
  { file: 'OhBulan 1.png', name: 'OhBulan 1' },
  { file: 'OhBulan 2.png', name: 'OhBulan 2' },
  { file: 'SAYS Tech.png', name: 'SAYS Tech' },
  { file: 'SAYS.png', name: 'SAYS' },
  { file: 'Seismik Makan 2.png', name: 'Seismik Makan 2' },
  { file: 'Seismik Makan.png', name: 'Seismik Makan' },
  { file: 'Seismik.png', name: 'Seismik' },
  { file: 'Sirap Limau 1.png', name: 'Sirap Limau 1' },
  { file: 'Sirap Limau 3.png', name: 'Sirap Limau 3' },
  { file: 'TMR.png', name: 'TMR' },
  { file: 'Vocket 2.png', name: 'Vocket 2' },
  { file: 'Vocket.png', name: 'Vocket' },
  { file: 'XTRA.png', name: 'XTRA' }
];

export const NEWS_TEMPLATES: NewsTemplate[] = TEMPLATE_FILES.map((entry) => {
  const baseName = entry.id ?? entry.file?.replace(/\.png$/i, '') ?? entry.name;
  const normalizedId = baseName.toLowerCase().replace(/[_\s]+/g, '-');
  const templateImageUrl = entry.file
    ? new URL(`./template_image/${entry.file}`, import.meta.url).href
    : undefined;

  return {
    id: normalizedId,
    name: entry.name,
    description: `Template for ${entry.name}.`,
    templateImageUrl
  };
});
