import React from 'react';
import './globals.css';

const metadata = {
  title: 'Informe ISA - Asistente Virtual CampusLand',
  description: 'Análisis de conversión y métricas del Asistente Virtual ISA',
  keywords: ['ISA', 'chatbot', 'analytics', 'conversión', 'CampusLand', 'asistente virtual'],
  authors: [{ name: 'CampusLand' }],
  viewport: 'width=device-width, initial-scale=1',
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