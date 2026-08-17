'use client';

import React, { createContext, useContext } from 'react';

import type { TenantConfig } from '../utils/tenantServer';

export type { TenantConfig };

const TenantContext = createContext<TenantConfig | undefined>(undefined);

export interface TenantProviderProps {
  value: TenantConfig;
  children: React.ReactNode;
}

/**
 * Provides the active tenant configuration to the React tree.
 * Must wrap all components that require tenant-specific features or styling.
 *
 * @param props.value - The resolved tenant configuration object
 * @param props.children - The nested React elements
 * @returns A Context Provider wrapping the children
 *
 * @example
 * <TenantProvider value={config}>
 *   <App />
 * </TenantProvider>
 */
export function TenantProvider({ value, children }: TenantProviderProps) {
  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

/**
 * Accesses the active tenant configuration from the nearest Provider.
 * Enforces feature flag defaults if the tenant is the default or flags are missing.
 *
 * @returns The active TenantConfig with normalized feature flags
 * @throws {Error} If called outside of a TenantProvider or inside a Server Component
 *
 * @example
 * const { features, id } = useTenant();
 * if (features.viewer3d) render3dModel();
 */
export function useTenant(): TenantConfig {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a <TenantProvider />. Calling this in a Server Component is strictly prohibited.');
  }

  const isDefaultTenant = context.id === 'd3b07384-d113-495f-a558-8c38634e0000' || context.subdomain === 'default';

  // If the active tenant is the default tenant (or if specific feature flags are undefined), default to true for all features
  const viewer3d = isDefaultTenant || context.features?.viewer3d === undefined ? true : !!context.features.viewer3d;
  const engineeringCalculators = isDefaultTenant || context.features?.engineeringCalculators === undefined ? true : !!context.features.engineeringCalculators;
  const pdfExports = isDefaultTenant || context.features?.pdfExports === undefined ? true : !!context.features.pdfExports;

  return {
    ...context,
    features: {
      ...context.features,
      viewer3d,
      engineeringCalculators,
      pdfExports,
    },
  };
}
