
import { getModelOffset } from './src/utils/3dModelOffsets';

const slugs = [
    'basinclandirma-fanlari',
    'cati-tipi-fanlar',
    'duman-egzoz-fanlari',
    'endustriyel-fanlar',
    'kanal-tipi-fanlar'
];

slugs.forEach(slug => {
    try {
        const offset = getModelOffset(undefined, slug, 'centered');
        console.log(`Slug: ${slug} -> Offset:`, offset);
    } catch (e) {
        console.error(`Error for ${slug}:`, e);
    }
});
