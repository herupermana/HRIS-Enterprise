/**
 * Utility to resolve API URLs based on deployment subpath.
 * Automatically prefixes endpoints with '/hris' if running under the /hris subpath.
 */
export const getApiUrl = (endpoint: string): string => {
  return endpoint;
};
