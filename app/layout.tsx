import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header/Header";
import { Toaster } from "@/components/ui/toaster";
import Footer from "./components/Footer";
import { ThemeProvider } from "./components/ThemeProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import HideOnPaths from "./HideOnPaths";
import { Inter } from "next/font/google";
export const metadata: Metadata = {
  title: {
    absolute: "",
    default: "Test",
    template: "%s",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      // { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      // { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: { url: "/favicon.ico" },
  },
  keywords: [
    "video editing",
    "portfolio",
    "freelance",
    "creative",
    "video editor",
    "showcase",
    "professional",
  ],
  authors: [{ name: "Test Team" }],
  creator: "Test",
  publisher: "Test",
  description:
    "Test is a simple video review App for editors and their clients. Share projects, get timestamped feedback, and manage revisions with ease.",
  metadataBase: new URL("https://www.test.com"),
};
const inter = Inter({ subsets: ["latin"] });
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`antialiased flex flex-col min-h-screen ${inter.className}`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="flex-grow ">
            {" "}
            <HideOnPaths
              pathStarts={[
                "/login",
                "/signup",
                "/dashboard",
                "/live-track/",
                "/review/",

                "/complete-profile",
                "/set-password",
                "/account/",
                "/account",
              ]}
            >
              <Header />
            </HideOnPaths>
            {children}
            <Analytics />
            <SpeedInsights />
          </main>
          <HideOnPaths pathStarts={["/dashboard", "/review/", "/live-track/"]}>
            <Footer />
          </HideOnPaths>

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
