import Sidebar from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SecurityProvider } from "@/components/SecurityProvider";
import QueryProvider from "@/components/QueryProvider";
import { Toaster } from "sonner";
import { HiddenItemsProvider } from "@/components/HiddenItemsProvider";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <title>Prompt Archive</title>
        <link rel="icon" href="/peekr-logo.svg" type="image/svg+xml" />
        {/* Recover once from stale chunk/runtime mismatches after app updates */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts -- static files that must run before hydration */}
        <script src="/chunk-retry.js" />
        {/* eslint-disable-next-line @next/next/no-sync-scripts -- applies stored theme before first paint */}
        <script src="/theme-bootstrap.js" />
      </head>
      <body className="flex h-screen overflow-hidden transition-colors duration-(--pa-motion-slow)">
        <ThemeProvider>
          <QueryProvider>
            <SecurityProvider>
              <HiddenItemsProvider>
                <Sidebar />
                <main className="min-w-0 flex-1 overflow-x-clip overflow-y-auto bg-pa-cream pt-14 min-h-screen pb-24 sm:pt-16 sm:pb-28 lg:ml-58 lg:pt-0 lg:pb-6">
                  {children}
                </main>
              </HiddenItemsProvider>
              <Toaster
                position="bottom-right"
                richColors
                closeButton
                toastOptions={{
                  duration: 3000,
                  className:
                    "!bg-pa-paper !border-pa-border !text-pa-text dark:!bg-pa-paper dark:!border-pa-border dark:!text-pa-text",
                }}
                containerAriaLabel="Notifications"
              />
            </SecurityProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
