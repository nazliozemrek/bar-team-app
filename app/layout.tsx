import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata = {
  title: "Bar Team App",
  description: "Bar Checklist & Schedule App for Team",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Manifest and theme */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#111827" />

        {/* iOS Support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />

        {/* Favicon fallback */}
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <NavBar />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
