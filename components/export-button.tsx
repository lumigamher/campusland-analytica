'use client';

import React from 'react';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { AnalysisResult } from '../types';

interface ExportButtonProps {
    data: AnalysisResult;
    fileName?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ data, fileName = 'reporte-isa' }) => {
    const handleExport = () => {
        // Crear las hojas de Excel
        const wb = XLSX.utils.book_new();

        // Datos globales
        const globalesData = [
            ['Métricas Globales'],
            ['Total Usuarios Chat', data.global.totalChatUsers],
            ['Total Teléfonos Válidos', data.global.totalValidPhones],
            ['Total Conversiones', data.global.totalConversiones],
            ['Total Registros', data.global.totalRegistros],
            ['Tasa de Conversión Global', `${data.global.tasaConversionGlobal.toFixed(2)}%`],
            [],
            ['Datos por Ciudad', 'Bucaramanga', 'Bogotá'],
            ['Usuarios Chat', data.bucaramanga.chatUsers, data.bogota.chatUsers],
            ['Teléfonos Válidos', data.bucaramanga.validPhones, data.bogota.validPhones],
            ['Registros', data.bucaramanga.registros, data.bogota.registros],
            ['Conversiones', data.bucaramanga.conversiones, data.bogota.conversiones],
            ['Tasa de Conversión', 
                `${data.bucaramanga.tasaConversion.toFixed(2)}%`,
                `${data.bogota.tasaConversion.toFixed(2)}%`
            ]
        ];

        // Usuarios de Bucaramanga
        const usuariosBucaData = data.bucaramanga.usuarios.map(user => ([
            user.nombre,
            user.edad || 'N/A',
            user.celular,
            new Date(user.fecha).toLocaleString('es-CO'),
            user.estado || (user.registrado ? 'Registrado' : 'Solo Chat')
        ]));

        // Usuarios de Bogotá
        const usuariosBogData = data.bogota.usuarios.map(user => ([
            user.nombre,
            user.edad || 'N/A',
            user.celular,
            new Date(user.fecha).toLocaleString('es-CO'),
            user.estado || (user.registrado ? 'Registrado' : 'Solo Chat')
        ]));

        // Agregar las hojas al libro
        XLSX.utils.book_append_sheet(
            wb,
            XLSX.utils.aoa_to_sheet(globalesData),
            'Resumen Global'
        );

        XLSX.utils.book_append_sheet(
            wb,
            XLSX.utils.aoa_to_sheet([
                ['Nombre', 'Edad', 'Celular', 'Fecha', 'Estado'],
                ...usuariosBucaData
            ]),
            'Usuarios Bucaramanga'
        );

        XLSX.utils.book_append_sheet(
            wb,
            XLSX.utils.aoa_to_sheet([
                ['Nombre', 'Edad', 'Celular', 'Fecha', 'Estado'],
                ...usuariosBogData
            ]),
            'Usuarios Bogotá'
        );

        // Guardar el archivo
        XLSX.writeFile(wb, `${fileName}-${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
            <Download className="w-4 h-4" />
            Exportar Datos
        </button>
    );
};