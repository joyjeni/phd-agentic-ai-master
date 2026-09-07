import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  serverExternalPackages: ["pptxgenjs"],
  async rewrites() {
    return [
      { source: "/slides.pptx", destination: "/api/slides/pptx" },
      { source: "/slides.pdf", destination: "/api/slides/pdf" },
      { source: "/slides.zip", destination: "/api/slides/zip" },
    ];
  },
  async headers() {
    return [
      {
        source: "/:file*.pptx",
        headers: [
          {
            key: "Content-Type",
            value:
              "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          },
          {
            key: "Content-Disposition",
            value: 'attachment; filename="JenishaT_ACRS_PhD_Proposal.pptx"',
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        source: "/:file*.zip",
        headers: [
          {
            key: "Content-Disposition",
            value: 'attachment; filename="JenishaT_ACRS_PhD_Proposal.zip"',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
