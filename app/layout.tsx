import type React from "react"
import type { Metadata } from "next"
import { Inter, Rubik } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
})

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-rubik",
})

export const metadata: Metadata = {
  title: "Your City Vibe",
  description: "Descubre lugares perfectos para tu mood",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${rubik.variable} bg-gradient-to-b from-[#111] to-[#1e1e1e] antialiased`}>
        {children}
      </body>
    </html>
  )
}
