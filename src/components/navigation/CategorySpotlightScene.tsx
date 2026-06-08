'use client'

import { Environment, Float, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import React, { Suspense } from 'react'

import Category3DIcon from '../products/Category3DIcon'

interface CategorySpotlightSceneProps {
  categorySlug: string
}

const CategorySpotlightScene: React.FC<CategorySpotlightSceneProps> = ({ categorySlug }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0.15, 2.3], fov: 40 }} dpr={[1, 1.5]}>
        <ambientLight intensity={2.2} />
        <directionalLight position={[4, 6, 5]} intensity={2.8} color="#ffffff" />
        <pointLight position={[-5, -2, 3]} intensity={1.8} color="#8ec5ff" />
        <spotLight position={[0, 5, 0]} intensity={1.5} angle={0.5} penumbra={1} />

        <Suspense fallback={null}>
          <Float speed={2} rotationIntensity={0.2} floatIntensity={0.45}>
            <Category3DIcon categorySlug={categorySlug} scale={1.1} />
          </Float>
          <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} autoRotate autoRotateSpeed={1.8} />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default CategorySpotlightScene
