import { ImageResponse } from "next/og";

export const alt = "Couragely — Beat the freeze.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Green-brand OG card for couragely.app (link previews / social shares).
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          background: "#0B0B0D",
          backgroundImage:
            "radial-gradient(60% 60% at 80% 10%, rgba(52,209,126,0.22), transparent 70%)",
          color: "#F4F3F0",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 30,
            letterSpacing: 8,
            color: "#34D17E",
            fontWeight: 800,
          }}
        >
          COURAGELY
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            fontSize: 78,
            fontWeight: 800,
            marginTop: 22,
            lineHeight: 1.05,
          }}
        >
          <span style={{ marginRight: 20 }}>Most men</span>
          <span style={{ marginRight: 20, color: "#34D17E" }}>freeze.</span>
          <span>Be the one who doesn&apos;t.</span>
        </div>
        <div
          style={{ display: "flex", fontSize: 34, color: "#9A9CA3", marginTop: 26 }}
        >
          Every approach counts · win or lose · 18+
        </div>
      </div>
    ),
    { ...size },
  );
}
