import { getFoodTruckByHostname } from './getFoodTruckByHostname';
import { unstable_cacheTag, unstable_cacheLife } from 'next/cache';

export async function getFoodTruckData(subdomain: string, isAdmin = false) {
  'use cache';
  unstable_cacheTag(`foodTruck:${subdomain}`);
  unstable_cacheLife({ stale: 300, revalidate: 300 });
  
  return getFoodTruckByHostname(subdomain, isAdmin);

};