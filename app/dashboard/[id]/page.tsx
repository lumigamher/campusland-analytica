'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { AnalysisResult } from '../../../types';
import React from 'react';

const Dashboard = dynamic(() => import('../../../components/dashboard'), {
    ssr: false
});

export default function DashboardPage({ params }: { params: { id: string } }) {
    const [data, setData] = useState<AnalysisResult | null>(null);

    useEffect(() => {
        // Intentar cargar los datos desde localStorage usando el ID
        const savedData = localStorage.getItem('dashboardData');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (parsed.id === params.id) {
                    setData(parsed.data);
                }
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            }
        }
    }, [params.id]);

    if (!data) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
                    <h1 className="text-2xl font-bold mb-4">Dashboard no encontrado</h1>
                    <p className="text-gray-600">El dashboard que buscas no está disponible o ha expirado.</p>
                    <a 
                        href="/"
                        className="mt-6 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Crear nuevo análisis
                    </a>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 p-4">
            <div className="mb-6 flex justify-end">
                <a 
                    href="/"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                    Crear nuevo análisis
                </a>
            </div>
            <Dashboard data={data} />
        </main>
    );
}