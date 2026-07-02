import ApproachlyApp from "./ApproachlyApp";

// Phase 1: render the faithful port of the design (self-contained, mock state).
// Phase 2 will gate on Clerk auth + drive it from Convex.
export default function Page() {
  return <ApproachlyApp startScreen="Onboarding" />;
}
