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
 * Injects the tenant configuration context into the React component tree.
 * Should be placed high in the application hierarchy to make tenant context available to client components.
 *
 * @param props - The provider props
 * @param props.value - The resolved configuration for the active tenant
 * @param props.children - Child elements that will have access to the tenant context
 * @returns The populated context provider element
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
 * Retrieves the current tenant's configuration from context and enforces feature flag defaults.
 * If the active tenant is the system default, or if specific feature flags are omitted, it enables all default features.
 *
 * @returns The enriched tenant configuration object with normalized feature flags
 * @throws {Error} If called outside of a <TenantProvider /> or inside a Server Component
 *
 * @example
 * const { features, subdomain } = useTenant();
 * if (features.viewer3d) renderViewer();
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
