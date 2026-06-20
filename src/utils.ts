/**
 * Utility to resolve API URLs based on deployment subpath.
 * Automatically prefixes endpoints with '/hris' if running under the /hris subpath.
 */
export const getApiUrl = (endpoint: string): string => {
  const hasHris = typeof window !== 'undefined' && window.location.pathname.startsWith('/hris');
  if (hasHris) {
    // If endpoint starts with "/", avoid duplicate slashes
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `/hris/${cleanEndpoint}`;
  }
  return endpoint;
};
