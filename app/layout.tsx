import type React from "react"
import "@/app/globals.css"
import { Orbitron, Exo, Open_Sans } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteNav } from "@/components/site-nav"
import dynamic from 'next/dynamic'

// Dynamically import the API status component
const ApiStatusIndicator = dynamic(
  () => import('@/components/api-status-indicator')
)

// Dynamically import the ErrorBoundary component
const ErrorBoundary = dynamic(
  () => import('@/components/error-boundary')
)

// Font definitions
const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-orbitron",
})

const exo = Exo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-exo",
})

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-open-sans",
})

// Custom font for Rajdhani (not available in next/font/google)
export const metadata = {
  title: "NCAA Basketball Bracket Challenge 2025",
  description: "AI Agents Prediction Battle for the 2025 NCAA Basketball Tournament",
  generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body className={`${orbitron.variable} ${exo.variable} ${openSans.variable} font-sans bg-black text-white`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SiteNav />
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <ApiStatusIndicator />
        </ThemeProvider>
      </body>
    </html>
  )
}

import './globals.css'