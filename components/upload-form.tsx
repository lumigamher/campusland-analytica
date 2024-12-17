'use client';

import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

interface UploadFormProps {
    onFilesSelected: (files: {
        chatBuca: File;
        chatBog: File;
        estBuca: File;
        estBog: File;
    }) => void;
    isLoading?: boolean;
}

export const UploadForm: React.FC<UploadFormProps> = ({ onFilesSelected, isLoading }) => {
    const [files, setFiles] = useState<{
        chatBuca?: File;
        chatBog?: File;
        estBuca?: File;
        estBog?: File;
    }>({});

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileKey: keyof typeof files) => {
        if (e.target.files && e.target.files[0]) {
            setFiles(prev => ({
                ...prev,
                [fileKey]: e.target.files![0]
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (files.chatBuca && files.chatBog && files.estBuca && files.estBog) {
            onFilesSelected({
                chatBuca: files.chatBuca,
                chatBog: files.chatBog,
                estBuca: files.estBuca,
                estBog: files.estBog
            });
        }
    };

    const FileInput = ({ id, label }: {
        id: keyof typeof files;
        label: string;
    }) => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>
            <div className="flex items-center justify-center w-full">
                <label
                    htmlFor={id}
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click para seleccionar archivo Excel</span>
                        </p>
                        <p className="text-xs text-gray-500">Archivo .xlsx</p>
                    </div>
                    <input
                        id={id}
                        type="file"
                        className="hidden"
                        accept=".xlsx"
                        onChange={(e) => handleFileChange(e, id)}
                        disabled={isLoading}
                    />
                </label>
            </div>
            {files[id]?.name && (
                <p className="mt-2 text-sm text-gray-600">
                    Archivo seleccionado: {files[id]?.name}
                </p>
            )}
        </div>
    );

    return (
        <Card className="max-w-2xl mx-auto mt-10 p-6">
            <CardHeader>
                <CardTitle>Cargar Archivos Excel</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <FileInput
                        id="chatBuca"
                        label="Chat Bucaramanga (Archivo Excel con 2 hojas: chat y usuarios)"
                    />
                    
                    <FileInput
                        id="chatBog"
                        label="Chat Bogotá (Archivo Excel con 2 hojas: chat y usuarios)"
                    />
                    
                    <FileInput
                        id="estBuca"
                        label="Estudiantes Bucaramanga (Archivo Excel con datos de registro)"
                    />
                    
                    <FileInput
                        id="estBog"
                        label="Estudiantes Bogotá (Archivo Excel con datos de registro)"
                    />

                    <button
                        type="submit"
                        disabled={!files.chatBuca || !files.chatBog || !files.estBuca || !files.estBog || isLoading}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 
                                disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Procesando...' : 'Analizar Datos'}
                    </button>
                </form>
            </CardContent>
        </Card>
    );
};