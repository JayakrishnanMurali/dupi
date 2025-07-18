import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { AuthProvider } from "@/lib/auth/context";
import { QueryProvider } from "@/lib/query-client";

export const metadata: Metadata = {
  title: "Dupi - Mock API Generator",
  description: "Generate mock APIs from TypeScript interfaces instantly",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
