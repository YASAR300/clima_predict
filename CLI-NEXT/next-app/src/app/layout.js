import "./globals.css";
import InstallPrompt from "@/components/InstallPrompt";
import ConditionalLayout from "@/components/ConditionalLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import BeamsClient from "@/components/BeamsClient";

export const metadata = {
  title: "ClimaPredict - Weather Forecast for Farmers",
  description: "AI-powered weather forecasting and farming recommendations",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ClimaPredict",
  },
};

export const viewport = {
  themeColor: "#00D09C",
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00D09C" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ClimaPredict" />
        <link rel="apple-touch-icon" href="/icons/Icon-192.png" />
        <link rel="preconnect" href="https://api.openweathermap.org" />
        <link rel="dns-prefetch" href="https://api.openweathermap.org" />
      </head>
      <body className="antialiased h-screen overflow-hidden w-full bg-[#0D0D0D] text-white selection:bg-[#00D09C] selection:text-[#0D0D0D]" style={{
        maxWidth: '100vw',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        WebkitTapHighlightColor: 'transparent',
      }}>
        {/* Animated Background Glows */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00D09C]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#4D9FFF]/10 rounded-full blur-[120px]" />
        </div>

        <AuthProvider>
          <BeamsClient />
          <ConditionalLayout>
            {children}
            <InstallPrompt />
          </ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
