import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
