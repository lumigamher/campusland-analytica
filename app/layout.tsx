import React from 'react';
import './globals.css';

const metadata = {
  title: 'Dashboard de Conversión ChatBot',
  description: 'Análisis de conversión del ChatBot a registros',
  keywords: ['dashboard', 'chatbot', 'analytics', 'conversión', 'CampusLand'],
  authors: [{ name: 'CampusLand' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#000' },
  ],
};

export { metadata };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 antialiased">
        <main className="relative flex min-h-screen flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}