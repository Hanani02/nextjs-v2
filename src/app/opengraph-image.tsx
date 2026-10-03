import { ImageResponse } from "next/og";

export const alt = "Muhammad Akbar Hanani - Fullstack & Web Developer Portfolio";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          background: "linear-gradient(135deg, #0b0f19 0%, #0f172a 40%, #1e1b4b 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow Effects */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(167, 139, 250, 0.25) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)",
          }}
        />

        {/* Top Header Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 22px",
              borderRadius: "999px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              fontSize: "18px",
              color: "#c4b5fd",
              fontWeight: 600,
            }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#10b981",
              }}
            />
            Available for Projects
          </div>

          <div
            style={{
              fontSize: "20px",
              color: "rgba(255, 255, 255, 0.6)",
              fontWeight: 500,
            }}
          >
            portofolio-hanan.vercel.app
          </div>
        </div>

        {/* Center Main Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            zIndex: 10,
            maxWidth: "960px",
          }}
        >
          <div
            style={{
              fontSize: "64px",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              background: "linear-gradient(to right, #ffffff, #e0e7ff, #a78bfa)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Muhammad Akbar Hanani
          </div>

          <div
            style={{
              fontSize: "30px",
              color: "#93c5fd",
              fontWeight: 600,
              letterSpacing: "0.01em",
            }}
          >
            Fullstack Developer & Web Developer
          </div>

          <div
            style={{
              fontSize: "22px",
              color: "rgba(255, 255, 255, 0.75)",
              lineHeight: 1.5,
              maxWidth: "800px",
            }}
          >
            Building modern, high-performance web applications with clean code, seamless user experiences, and scalable architecture.
          </div>
        </div>

        {/* Bottom Tech Pills */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            zIndex: 10,
          }}
        >
          {["Next.js", "React", "TypeScript", "Tailwind CSS", "Supabase", "Node.js"].map((tech) => (
            <div
              key={tech}
              style={{
                padding: "8px 18px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                fontSize: "18px",
                color: "#e2e8f0",
                fontWeight: 500,
              }}
            >
              {tech}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
