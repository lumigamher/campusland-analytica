'use client';

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { UploadForm } from "../components/upload-form";
import type { AnalysisResult } from "../types";
import { useSearchParams, useRouter } from 'next/navigation';

const Dashboard = dynamic(() => import('../components/dashboard'), {
    ssr: false
});

export default function Home() {
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [shareUrl, setShareUrl] = useState<string>('');
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Intentar cargar datos del URL si existen
        const data = searchParams.get('data');
        if (data) {
            try {
                const decodedData = JSON.parse(atob(data));
                setAnalysisResult(decodedData);
            } catch (err) {
                console.error('Error al cargar datos:', err);
            }
        }
    }, [searchParams]);

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
            setAnalysisResult(result);

            // Crear URL compartible
            const encodedData = btoa(JSON.stringify(result));
            const url = `${window.location.origin}?data=${encodedData}`;
            setShareUrl(url);

            // Actualizar URL
            router.push(`?data=${encodedData}`);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error al procesar los archivos';
            setError(errorMessage);
            console.error('Error procesando archivos:', err);
        } finally {
            setLoading(false);
        }
    };

    const copyShareUrl = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            alert('URL copiada al portapapeles');
        } catch (err) {
            console.error('Error al copiar URL:', err);
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
                    <div className="mb-6 flex justify-end">
                        <button
                            onClick={copyShareUrl}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Compartir Dashboard
                        </button>
                    </div>
                    <Dashboard data={analysisResult} />
                </div>
            )}
        </main>
    );
}