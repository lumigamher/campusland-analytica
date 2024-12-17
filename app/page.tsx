'use client';

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { UploadForm } from "../components/upload-form";
import type { AnalysisResult } from "../types";

const Dashboard = dynamic(() => import('../components/dashboard'), {
    ssr: false
});

export default function Home() {
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uniqueId, setUniqueId] = useState<string | null>(null);

    useEffect(() => {
        // Intentar cargar datos del localStorage
        const savedData = localStorage.getItem('dashboardData');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                setAnalysisResult(parsedData.data);
                setUniqueId(parsedData.id);
            } catch (err) {
                console.error('Error al cargar datos guardados:', err);
            }
        }
    }, []);

    const handleFilesSelected = async (files: {
        chatBuca: File;
        chatBog: File;
        estBuca: File;
        estBog: File;
    }) => {
        setLoading(true);
        setError(null);
        try {
            const { processExcelFiles } = await import('../lib/excel-processor');
            const result = await processExcelFiles(
                files.chatBuca,
                files.chatBog,
                files.estBuca,
                files.estBog
            );
            
            // Generar ID único
            const newId = Math.random().toString(36).substring(2) + Date.now().toString(36);
            
            // Guardar en localStorage
            localStorage.setItem('dashboardData', JSON.stringify({
                id: newId,
                data: result
            }));

            setAnalysisResult(result);
            setUniqueId(newId);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al procesar los archivos';
            setError(errorMessage);
            console.error('Error procesando archivos:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        if (uniqueId) {
            const url = `${window.location.origin}/dashboard/${uniqueId}`;
            try {
                await navigator.clipboard.writeText(url);
                alert('URL copiada al portapapeles. Puedes compartir este enlace para ver el dashboard.');
            } catch (err) {
                alert('La URL para compartir es: ' + url);
            }
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 p-4">
            {!analysisResult ? (
                <div className="max-w-4xl mx-auto">
                    <UploadForm onFilesSelected={handleFilesSelected} isLoading={loading} />
                    {error && (
                        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
                            <p className="font-semibold">Error al procesar los archivos:</p>
                            <p>{error}</p>
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    {uniqueId && (
                        <div className="mb-6 flex justify-end gap-4">
                            <button
                                onClick={handleShare}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Compartir Dashboard
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.removeItem('dashboardData');
                                    setAnalysisResult(null);
                                    setUniqueId(null);
                                }}
                                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                            >
                                Nuevo Análisis
                            </button>
                        </div>
                    )}
                    <Dashboard data={analysisResult} />
                </div>
            )}
        </main>
    );
}