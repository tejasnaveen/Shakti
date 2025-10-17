export const getDomainConfig = () => {
  const environment = import.meta.env.VITE_APP_ENVIRONMENT || 'development';
  const baseDomain = import.meta.env.VITE_APP_BASE_DOMAIN || 'yourapp.com';

  return {
    environment,
    baseDomain,
    getFullSubdomainUrl: (subdomain: string) => {
      if (environment === 'development') {
        return `${subdomain}.${baseDomain}`;
      }
      return `https://${subdomain}.${baseDomain}`;
    },
    getLoginUrl: (subdomain: string) => {
      if (environment === 'development') {
        return `${subdomain}.${baseDomain}`;
      }
      return `https://${subdomain}.${baseDomain}/login`;
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
