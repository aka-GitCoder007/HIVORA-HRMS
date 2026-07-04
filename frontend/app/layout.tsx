import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/authContext'
import { ThemeProvider } from '@/lib/themeContext'

export const metadata: Metadata = {
  title: 'Employee Management System',
  description: 'Complete employee management platform with profile, attendance, leave, and payroll management',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
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
            {children}
            {process.env.NODE_ENV === 'production' && <Analytics />}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
