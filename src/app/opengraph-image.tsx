import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt =
  "Muhammad Akbar Hanani - Software Developer & UI/UX Designer";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  const imagePath = join(process.cwd(), "public", "image", "gemini.png");

  let imageData: string | null = null;

  try {
    const file = await readFile(imagePath);
    imageData = `data:image/png;base64,${file.toString("base64")}`;
  } catch (error) {
    console.error("Failed to load gemini.png:", error);
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "50px 60px",
          background:
            "linear-gradient(135deg, #090a0f 0%, #0d111a 50%, #111827 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow kanan atas */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-80px",
            width: "550px",
            height: "550px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(59, 130, 246, 0.22) 0%, transparent 70%)",
          }}
        />

        {/* Glow kiri bawah */}
        <div
          style={{
            position: "absolute",
            bottom: "-140px",
            left: "-100px",
            width: "550px",
            height: "550px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)",
          }}
        />

        {/* LEFT */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            height: "100%",
            width: "650px",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              alignSelf: "flex-start",
              padding: "8px 18px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#22c55e",
              }}
            />

            <span
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "#e2e8f0",
                letterSpacing: "0.08em",
              }}
            >
              PORTFOLIO &amp; PROFILE
            </span>
          </div>

          {/* Main content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              margin: "20px 0",
            }}
          >
            <div
              style={{
                fontSize: "48px",
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                color: "#f8fafc",
              }}
            >
              Muhammad Akbar Hanani
            </div>

            <div
              style={{
                fontSize: "23px",
                fontWeight: 600,
                color: "#60a5fa",
                letterSpacing: "0.01em",
              }}
            >
              Software Developer &amp; UI/UX Designer
            </div>

            <div
              style={{
                fontSize: "18px",
                color: "#94a3b8",
                lineHeight: 1.5,
                marginTop: "4px",
                width: "610px",
              }}
            >
              Showcase proyek web development modern, desain UI/UX responsif,
              dan solusi fullstack engineering.
            </div>
          </div>

          {/* Bottom */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              paddingTop: "20px",
              borderTop: "1px solid rgba(255,255,255,0.12)",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >
              {["Next.js", "TypeScript", "Tailwind", "Supabase"].map(
                (tag) => (
                  <div
                    key={tag}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      fontSize: "14px",
                      color: "#cbd5e1",
                      fontWeight: 500,
                    }}
                  >
                    {tag}
                  </div>
                )
              )}
            </div>

            <div
              style={{
                fontSize: "16px",
                color: "#60a5fa",
                fontWeight: 600,
              }}
            >
              portofolio-hanann.vercel.app
            </div>
          </div>
        </div>

        {/* RIGHT - PHOTO */}
        {imageData && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "430px",
              height: "430px",
              borderRadius: "28px",
              padding: "10px",
              background:
                "linear-gradient(135deg, rgba(59,130,246,0.28) 0%, rgba(99,102,241,0.15) 100%)",
              border: "1px solid rgba(255,255,255,0.16)",
              position: "relative",
              zIndex: 2,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageData}
              alt="Muhammad Akbar Hanani"
              width={410}
              height={410}
              style={{
                borderRadius: "22px",
                objectFit: "cover",
              }}
            />
          </div>
        )}
      </div>
    ),
    {
      ...size,
    }
  );
}