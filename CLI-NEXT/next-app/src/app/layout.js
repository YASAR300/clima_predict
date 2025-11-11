import "./globals.css";
import InstallPrompt from "@/components/InstallPrompt";

export const metadata = {
  title: "ClimaPredict - Weather Forecast for Farmers",
  description: "AI-powered weather forecasting and farming recommendations",
  manifest: "/manifest.json",
  themeColor: "#00D09C",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ClimaPredict",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#00D09C" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ClimaPredict" />
        <link rel="apple-touch-icon" href="/icons/Icon-192.png" />
      </head>
      <body className="antialiased">
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
