import DeployButton from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";


export const metadata = {
  title: "Mini-Delve",
  description: "The fastest way to comply with Supabase security best practices",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col">
            <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-gradient-to-r from-emerald-600 to-blue-600">
              <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
                <div className="flex gap-5 items-center font-semibold">
                  <Link href={"/"} className="text-white font-bold text-xl">
                    Mini-Delve
                    <span className="text-xs ml-2 bg-white text-emerald-600 px-2 py-1 rounded-full">
                      Compliance
                    </span>
                  </Link>
                </div>
                <HeaderAuth />
              </div>
            </nav>

            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-full max-w-5xl px-5">
                {children}
              </div>
            </div>

            <footer className="w-full border-t mt-auto">
              <div className="max-w-5xl mx-auto py-8 text-center text-sm text-foreground/60">
                Copyright © 2024 Mini-Delve. All rights reserved.
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
