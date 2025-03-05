import { getFoodTruckByHostname } from './getFoodTruckByHostname';
import { cache } from 'react';

// Use React's cache function to memoize the result
export const getFoodTruckData = cache(async (subdomain: string, isAdmin = false) => {
  return getFoodTruckByHostname(subdomain, isAdmin);
});