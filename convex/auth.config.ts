// Convex ↔ Clerk auth bridge.
// Set CLERK_JWT_ISSUER_DOMAIN in the Convex dashboard (Settings → Environment
// Variables) to your Clerk Frontend API / Issuer URL, e.g.
//   https://your-app.clerk.accounts.dev
// and create a Clerk JWT template named exactly "convex".
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
