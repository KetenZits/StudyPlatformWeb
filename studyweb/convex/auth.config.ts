// convex/auth.config.ts
import { clerkAuth } from '@convex-dev/auth-clerk';

export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
};