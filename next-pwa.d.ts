declare module "next-pwa" {
  import { NextConfig } from "next";

  interface PwaOptions {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    scope?: string;
    sw?: string;
    additionalManifestEntries?: any[];
    publicExcludes?: string[];
    buildExcludes?: string[];
    cacheOnFrontEndNav?: boolean;
    aggressiveFrontEndNavCaching?: boolean;
    reloadOnOnline?: boolean;
    swDest?: string;
    swSrc?: string;
  }

  function withPWA(options: PwaOptions): (nextConfig: NextConfig) => NextConfig;

  export default withPWA;
}
