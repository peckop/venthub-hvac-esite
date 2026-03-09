'use client'

import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Float, OrbitControls } from '@react-three/drei'

import Category3DIcon from '../products/Category3DIcon'

interface CategorySpotlightSceneProps {
  categorySlug: string
}

const CategorySpotlightScene: React.FC<CategorySpotlightSceneProps> = ({ categorySlug }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0.15, 2.3], fov: 40 }} dpr={[1, 1.5]}>
        <ambientLight intensity={1.8} />
        <directionalLight position={[4, 6, 5]} intensity={2.2} color="#ffffff" />
        <pointLight position={[-5, -2, 3]} intensity={1.4} color="#8ec5ff" />

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
