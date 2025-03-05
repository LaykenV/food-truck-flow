import { getFoodTruckByHostname } from './getFoodTruckByHostname';
import { cache } from 'react';

// Use React's cache function to memoize the result
export const getFoodTruckData = cache(async (subdomain: string) => {
  return getFoodTruckByHostname(subdomain);
});