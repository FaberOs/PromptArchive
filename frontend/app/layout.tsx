import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SecurityProvider } from "@/components/SecurityProvider";
import QueryProvider from "@/components/QueryProvider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Prompt Archive",
  description: "Local Offline Prompt Manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className={`${inter.className} flex h-screen overflow-hidden transition-colors duration-300`}>
        <ThemeProvider>
          <QueryProvider>
            <SecurityProvider>
              <Sidebar />
              <main className="flex-1 lg:ml-64 px-4 sm:px-6 lg:px-10 pb-6 overflow-y-auto h-full pt-16 lg:pt-8">
                  {children}
              </main>
              <Toaster 
                position="bottom-right" 
                richColors 
                closeButton
                toastOptions={{
                  duration: 3000,
                  className: "!bg-white dark:!bg-slate-900 !border-slate-200 dark:!border-slate-800 !text-slate-900 dark:!text-slate-100",
                }}
              />
            </SecurityProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}