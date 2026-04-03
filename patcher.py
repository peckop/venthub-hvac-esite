import re
import os

files = [
    'src/app/_components/ProductDetailPageView.tsx',
    'src/components/admin/AdminRealtimeNotifications.tsx',
    'src/components/admin/CommandPalette.tsx',
    'src/components/admin/dashboard/RecentOrdersTable.tsx',
    'src/components/admin/dashboard/StatCard.tsx',
    'src/components/BentoGrid.tsx',
    'src/components/calculators/CalculatorLayout.tsx',
    'src/components/category/CategoryHero.tsx',
    'src/components/home/ApplicationSolutions.tsx',
    'src/components/home/HomeSinevizyon.tsx',
    'src/components/home/KnowledgeBlock.tsx',
    'src/components/navigation/Breadcrumb.tsx',
    'src/components/navigation/NavActionButton.tsx',
    'src/components/navigation/NavPrimaryRail.tsx',
    'src/components/navigation/NavSecondaryRail.tsx',
    'src/components/products/ApplicationCards.tsx',
    'src/components/products/SeriesCard.tsx',
    'src/components/SearchOverlay.tsx',
    'src/components/TickerLane.tsx',
    'src/hooks/useCategoryGateway.ts',
    'src/views/account/AccountLayout.tsx',
    'src/views/account/AccountSecurityPage.tsx',
    'src/views/admin/AdminAuditLogPage.tsx',
    'src/views/admin/AdminLayout.tsx',
    'src/views/admin/AdminMovementsPage.tsx',
    'src/views/calculators/AirCurtainCalcPage.tsx',
    'src/views/calculators/HRVCalcPage.tsx',
    'src/views/knowledge/TopicPage.tsx',
    'src/views/LoginPage.tsx',
    'src/views/support/SupportHomePage.tsx'
]

for filepath in files:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        orig_content = content
        
        # Applying replacements for router.push, replacement, and href={}
        # Using a safer approach with regex to avoid messing up imports or existing 'as Route'
        
        content = re.sub(r'router\.push\(([^,)]+)\)', lambda m: f'router.push({m.group(1)} as import(\'next\').Route)' if 'Route' not in m.group(1) else m.group(0), content)
        content = re.sub(r'router\.push\(([^,]+),\s*([^)]+)\)', lambda m: f'router.push({m.group(1)} as import(\'next\').Route, {m.group(2)})' if 'Route' not in m.group(1) else m.group(0), content)
        content = re.sub(r'router\.replace\(([^,)]+)\)', lambda m: f'router.replace({m.group(1)} as import(\'next\').Route)' if 'Route' not in m.group(1) else m.group(0), content)
        content = re.sub(r'router\.replace\(([^,]+),\s*([^)]+)\)', lambda m: f'router.replace({m.group(1)} as import(\'next\').Route, {m.group(2)})' if 'Route' not in m.group(1) else m.group(0), content)
        
        # for href={variable}
        content = re.sub(r'href=\{([a-zA-Z0-9_\.\?\:\(\)\[\] ]+)\}', lambda m: f'href={{{m.group(1)} as import(\'next\').Route}}' if 'Route' not in m.group(1) else m.group(0), content)
        
        if content != orig_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'Patched {filepath}')
