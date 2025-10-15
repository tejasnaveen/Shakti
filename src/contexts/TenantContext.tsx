import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tenant, TenantContextType } from '../types/tenant';
import { getTenantBySubdomain, getTenantIdentifier, isMainDomain } from '../utils/tenantDetection';

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeTenant = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get current hostname
        const hostname = window.location.hostname;
        console.log('Current hostname:', hostname);

        // Check if this is the main domain (superadmin access)
        if (isMainDomain(hostname)) {
          console.log('Main domain detected - superadmin access');
          setTenant(null);
          setIsLoading(false);
          return;
        }

        // Get tenant identifier from subdomain
        const tenantIdentifier = getTenantIdentifier(hostname);
        console.log('Tenant identifier:', tenantIdentifier);

        if (!tenantIdentifier) {
          console.log('No tenant identifier - using default tenant');
          setTenant(null);
          setIsLoading(false);
          return;
        }

        // Load tenant data
        const tenantData = await getTenantBySubdomain(tenantIdentifier);
        console.log('Tenant data loaded:', tenantData);

        if (!tenantData) {
          console.log('Tenant not found - using default tenant');
          setTenant(null);
          setIsLoading(false);
          return;
        }

        // Check if tenant is active
        if (tenantData.status !== 'active') {
          console.log('Tenant is not active - using default tenant');
          setTenant(null);
          setIsLoading(false);
          return;
        }

        setTenant(tenantData);
      } catch (err) {
        console.error('Error initializing tenant:', err);
        setTenant(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTenant();
  }, []);

  const clearTenant = () => {
    setTenant(null);
    setError(null);
  };

  const value: TenantContextType = {
    tenant,
    isLoading,
    error,
    setTenant,
    clearTenant
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
};