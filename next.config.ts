import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the Next.js dev-mode indicator: its fixed-position "N" logomark badge
  // was overlapping left-aligned leading icons (the playbook row, the freezes
  // flame). Dev-only UI; production never rendered it.
  devIndicators: false,
};

export default nextConfig;
