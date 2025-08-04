import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import { GlobalHeader } from '@/components/layout/GlobalHeader'
import { ToastProvider, ToastContainer } from '@/components/toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Nainovate Dashboard',
  description: 'A modern dashboard application built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ToastProvider>
            <GlobalHeader />
            <main className="pt-16">
              {children}
            </main>
            <ToastContainer position="top-right" />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
