let cachedBaseDomain: string | null = null;

export const extractBaseDomain = (hostname: string): string => {
  if (cachedBaseDomain) {
    return cachedBaseDomain;
  }

  const hostnameWithoutPort = hostname.split(':')[0];

  if (hostnameWithoutPort === 'localhost' || hostnameWithoutPort.includes('127.0.0.1')) {
    cachedBaseDomain = 'localhost';
    return cachedBaseDomain;
  }

  if (hostnameWithoutPort.includes('.local-credentialless.webcontainer-api.io')) {
    const fullDomain = hostnameWithoutPort;
    const parts = fullDomain.split('.');
    if (parts.length >= 2) {
      const domainSuffix = parts.slice(1).join('.');
      cachedBaseDomain = domainSuffix;
      return cachedBaseDomain;
    }
  }

  if (hostnameWithoutPort.includes('webcontainer-api.io')) {
    const match = hostnameWithoutPort.match(/([^.]+\.webcontainer-api\.io)$/);
    if (match) {
      cachedBaseDomain = match[1];
      return cachedBaseDomain;
    }
  }

  const parts = hostnameWithoutPort.split('.');
  if (parts.length >= 2) {
    cachedBaseDomain = parts.slice(-2).join('.');
    return cachedBaseDomain;
  }

  cachedBaseDomain = hostnameWithoutPort;
  return cachedBaseDomain;
};

export const getCurrentBaseDomain = (): string => {
  if (typeof window !== 'undefined') {
    return extractBaseDomain(window.location.hostname);
  }
  return import.meta.env.VITE_APP_BASE_DOMAIN || 'yourapp.com';
};

export const getDomainConfig = () => {
  const environment = import.meta.env.VITE_APP_ENVIRONMENT || 'development';
  const baseDomain = getCurrentBaseDomain();
  const currentProtocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
  const currentHost = typeof window !== 'undefined' ? window.location.host : '';

  return {
    environment,
    baseDomain,
    currentProtocol,
    currentHost,
    getFullSubdomainUrl: (subdomain: string) => {
      if (currentHost.includes('webcontainer-api.io')) {
        const fullHost = currentHost.split(':')[0];
        const match = fullHost.match(/^([^-]+)-(.+)$/);
        if (match) {
          const [, , suffix] = match;
          return `${currentProtocol}//${subdomain}-${suffix}`;
        }
        return `${currentProtocol}//${subdomain}.${baseDomain}`;
      }

      if (currentHost.includes('localhost')) {
        const port = currentHost.split(':')[1];
        return port ? `${currentProtocol}//${subdomain}.localhost:${port}` : `${currentProtocol}//${subdomain}.localhost`;
      }

      return `${currentProtocol}//${subdomain}.${baseDomain}`;
    },
    getLoginUrl: (subdomain: string) => {
      const baseUrl = getDomainConfig().getFullSubdomainUrl(subdomain);
      return `${baseUrl}/login`;
    },
    getDisplayDomain: (subdomain?: string) => {
      if (subdomain) {
        if (currentHost.includes('webcontainer-api.io')) {
          const fullHost = currentHost.split(':')[0];
          const match = fullHost.match(/^([^-]+)-(.+)$/);
          if (match) {
            const [, , suffix] = match;
            return `${subdomain}-${suffix}`;
          }
        }
        return `${subdomain}.${baseDomain}`;
      }
      return baseDomain;
    }
  };
};

export const RESERVED_SUBDOMAINS = [
  'www',
  'admin',
  'superadmin',
  'api',
  'app',
  'mail',
  'smtp',
  'ftp',
  'webmail',
  'cpanel',
  'whm',
  'blog',
  'forum',
  'shop',
  'store',
  'dashboard',
  'portal',
  'support',
  'help',
  'docs',
  'status',
  'dev',
  'staging',
  'test',
  'demo',
  'sandbox',
  'localhost',
  'ns1',
  'ns2',
  'dns',
  'cdn',
  'assets',
  'static',
  'media',
  'files',
  'images'
];

export const SUBDOMAIN_REGEX = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/;
