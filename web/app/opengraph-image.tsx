import { ImageResponse } from "next/og";

export const alt = "Grantaria — AI-powered scholarship matching for Florida high school seniors";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default Open Graph image served at /opengraph-image.png. Renders whenever
 * a grantaria.com link is unfurled in a chat, email, LinkedIn post, etc.
 * Built as JSX → PNG via @vercel/og (next/og).
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0A0E1A",
          backgroundImage:
            "radial-gradient(circle at 25% 30%, rgba(86, 224, 214, 0.18), transparent 55%), radial-gradient(circle at 75% 75%, rgba(244, 114, 182, 0.16), transparent 55%)",
          fontFamily: "sans-serif",
          padding: "80px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            fontSize: 144,
            fontWeight: 800,
            letterSpacing: "-0.045em",
            color: "#FFFFFF",
            lineHeight: 1,
          }}
        >
          <span>Grant</span>
          <span
            style={{
              background:
                "linear-gradient(135deg, #56E0D6 0%, #A78BFA 50%, #F472B6 100%)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            aria
          </span>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 36,
            color: "#A3AAB5",
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.3,
          }}
        >
          AI-ranked scholarships for Florida high school seniors
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 64,
            padding: "12px 28px",
            border: "1.5px solid rgba(86, 224, 214, 0.35)",
            borderRadius: 999,
            fontSize: 22,
            color: "#56E0D6",
            fontWeight: 600,
            letterSpacing: "0.05em",
          }}
        >
          grantaria.com
        </div>
      </div>
    ),
    { ...size },
  );
}
