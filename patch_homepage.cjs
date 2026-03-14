const fs = require('fs');
const file = 'src/views/HomePage.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/import HomeSinevizyon from '\.\.\/components\/home\/HomeSinevizyon'/,
  "import dynamic from 'next/dynamic'\n" +
  "const HomeSinevizyon = dynamic(() => import('../components/home/HomeSinevizyon'), { ssr: false, loading: () => <div className=\"w-full h-[80vh] lg:h-[90vh] min-h-[650px] bg-slate-950 animate-pulse\" /> })"
);

content = content.replace(/import CinematicProductShowcase from '\.\.\/components\/home\/CinematicProductShowcase'/,
  "const CinematicProductShowcase = dynamic(() => import('../components/home/CinematicProductShowcase'), { ssr: false, loading: () => <div className=\"w-full h-[600px] bg-white animate-pulse\" /> })"
);

content = content.replace(/import GuidedCategoryDiscovery from '\.\.\/components\/home\/GuidedCategoryDiscovery'/,
  "const GuidedCategoryDiscovery = dynamic(() => import('../components/home/GuidedCategoryDiscovery'), { ssr: false, loading: () => <div className=\"w-full h-[400px] bg-white animate-pulse\" /> })"
);

content = content.replace(/import ApplicationSolutions from '\.\.\/components\/home\/ApplicationSolutions'/,
  "const ApplicationSolutions = dynamic(() => import('../components/home/ApplicationSolutions'), { ssr: false, loading: () => <div className=\"w-full h-[500px] bg-white animate-pulse\" /> })"
);

content = content.replace(/import TrustProofSection from '\.\.\/components\/home\/TrustProofSection'/,
  "const TrustProofSection = dynamic(() => import('../components/home/TrustProofSection'), { ssr: false, loading: () => <div className=\"w-full h-[400px] bg-white animate-pulse\" /> })"
);

content = content.replace(/import FeaturedCommercialBlocks from '\.\.\/components\/home\/FeaturedCommercialBlocks'/,
  "const FeaturedCommercialBlocks = dynamic(() => import('../components/home/FeaturedCommercialBlocks'), { ssr: false, loading: () => <div className=\"w-full h-[600px] bg-white animate-pulse\" /> })"
);

content = content.replace(/import StrategicBrands from '\.\.\/components\/home\/StrategicBrands'/,
  "const StrategicBrands = dynamic(() => import('../components/home/StrategicBrands'), { ssr: false, loading: () => <div className=\"w-full h-[300px] bg-white animate-pulse\" /> })"
);

content = content.replace(/import KnowledgeBlock from '\.\.\/components\/home\/KnowledgeBlock'/,
  "const KnowledgeBlock = dynamic(() => import('../components/home/KnowledgeBlock'), { ssr: false, loading: () => <div className=\"w-full h-[400px] bg-white animate-pulse\" /> })"
);

content = content.replace(/import FinalCTA from '\.\.\/components\/home\/FinalCTA'/,
  "const FinalCTA = dynamic(() => import('../components/home/FinalCTA'), { ssr: false, loading: () => <div className=\"w-full h-[400px] bg-white animate-pulse\" /> })"
);

content = content.replace(/import RevealSection from '\.\.\/components\/home\/RevealSection'/,
  "const RevealSection = dynamic(() => import('../components/home/RevealSection'), { ssr: false })"
);


fs.writeFileSync(file, content);
console.log('HomePage patched for dynamic imports');
