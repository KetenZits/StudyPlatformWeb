// convex/auth.config.ts
import { clerkAuth } from "@convex-dev/auth-clerk";

export const auth = [
  clerkAuth({
    jwtTemplateName: "convex", // ต้องตรงกับ JWT template ที่สร้างใน Clerk
  }),
];
