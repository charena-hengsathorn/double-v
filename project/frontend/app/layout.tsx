import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '../app-shell/context/AuthContext'

export const metadata: Metadata = {
  title: 'Double V Dashboard',
  description: 'Executive Dashboard Suite for Revenue Forecasting',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
