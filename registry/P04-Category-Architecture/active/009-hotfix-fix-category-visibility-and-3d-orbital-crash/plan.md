# Implementation Plan - Fix 3D Orbital Crash & Category Visibility

## Goal
Resolve memory leaks (GPU OOM) in the 3D orbital carousel and fix visibility issues for categories by centralizing material/texture management and optimizing R3F components.

## Assumptions
- The crash is caused by repeated creation of Three.js objects (Materials, Textures, Geometries) in the render loop or without proper disposal.
- Visibility issues are due to inadequate lighting or improper fallback model handling.

## Plan

### 1. Centralize 3D Materials
- **Files**: `src/components/products/3d/materials/useFanMaterials.ts`
- **Change**: Refactor to use a shared static cache for materials to prevent re-creation across instances.
- **Verify**: Check console for material re-creation logs (if added) or monitor memory via browser task manager.

### 2. Fix Texture Leaks in Global Components
- **Files**: `src/components/products/BlueprintCanvas.tsx`, `src/components/products/OrbitalProductsShowcase.tsx`
- **Change**: 
    - In `BlueprintCanvas.tsx`, replace `new THREE.TextureLoader().load(image)` with `useTexture(image)` from `@react-three/drei`.
    - In `OrbitalProductsShowcase.tsx`, update `OrbitalCard` to use `useTexture` for images.
- **Verify**: Component unmount/remount should not increase GPU process memory in Chrome Task Manager.

### 3. Fix Resource Leaks in 3D Models
- **Files**: `src/components/products/3d/types/DuctFanModel.tsx`, `src/components/products/3d/types/RoofFanModel.tsx`, and others.
- **Change**: 
    - Move inline `new THREE.MeshStandardMaterial` definitions to `useFanMaterials.ts` or wrap in `useMemo` with proper disposal.
    - Replace manual `TextureLoader` with `useTexture`.
- **Verify**: Visually confirm models still render correctly.

### 4. Enhance Visibility & Lighting
- **Files**: `src/components/products/Category3DIcon.tsx`
- **Change**: 
    - Increase `ambientLight` intensity from 0.4 to 0.8.
    - Increase `pointLight` intensity from 2.5 to 4.5.
    - Add a `directionalLight` for better definition.
- **Verify**: Check category carousel to ensure all models are clearly visible.

### 5. Final Integration & Integrity Check
- **Files**: `registry/P04-CATEGORY-ARCHITECTURE/active/009-hotfix-fix-category-visibility-and-3d-orbital-crash/009-hotfix-fix-category-visibility-and-3d-orbital-crash.md`
- **Change**: Update status to `Completed`.
- **Verify**: Run `pnpm run lint` and `pnpm run build`.

## Risks & Mitigations
- **Risk**: `useTexture` might suspend if not wrapped in `Suspense`. 
- **Mitigation**: Ensure `Canvas` parents or specific components have `Suspense` boundaries.

## Rollback Plan
- Revert changes via `git checkout`.