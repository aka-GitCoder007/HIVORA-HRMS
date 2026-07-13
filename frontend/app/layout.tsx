import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/authContext'
import { ThemeProvider } from '@/lib/themeContext'
import { SplashScreen } from '@/components/ui/SplashScreen'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'HIVORA - HRMS',
  description: 'Complete employee management platform with profile, attendance, leave, and payroll management',
  generator: 'v0.app',
  icons: {
    icon: '/apple-touch-icon.png',
    apple: '/apple-touch-icon.png',
    shortcut: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0f172a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                document.documentElement.classList.remove('light');
                document.documentElement.classList.add('dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased bg-slate-950 text-gray-50">
        <AuthProvider>
          <ThemeProvider>
            <SplashScreen />
            {children}
            <Toaster richColors position="top-right" theme="dark" />
            {process.env.NODE_ENV === 'production' && <Analytics />}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
