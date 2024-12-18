'use client';

import { useState, useMemo } from 'react';
import type { AnalysisResult, UserData, UserFilter } from '../types';

export const useStats = (data: AnalysisResult) => {
    const [filters, setFilters] = useState<UserFilter>({
        fechaInicio: undefined,
        fechaFin: undefined,
        ciudad: undefined,
        estado: undefined
    });

    const filteredData = useMemo(() => {
        const allUsers = [...data.bucaramanga.usuarios, ...data.bogota.usuarios];
        
        return allUsers.filter(user => {
            const date = new Date(user.fecha);
            
            // Filtro por fecha
            if (filters.fechaInicio && date < new Date(filters.fechaInicio)) return false;
            if (filters.fechaFin && date > new Date(filters.fechaFin)) return false;
            
            // Filtro por ciudad
            if (filters.ciudad && user.ciudad.toLowerCase() !== filters.ciudad.toLowerCase()) return false;
            
            // Filtro por estado
            if (filters.estado) {
                if (filters.estado === 'no_registrado' && user.registrado) return false;
                if (filters.estado === 'registrado' && !user.registrado) return false;
                if (filters.estado !== 'registrado' && filters.estado !== 'no_registrado' && 
                    user.estado?.toLowerCase() !== filters.estado.toLowerCase()) return false;
            }
            
            return true;
        });
    }, [data, filters]);

    const stats = useMemo(() => {
        const total = filteredData.length;
        const registrados = filteredData.filter(u => u.registrado).length;
        
        return {
            total,
            registrados,
            noRegistrados: total - registrados,
            tasaConversion: total > 0 ? (registrados / total) * 100 : 0,
            porCiudad: {
                bucaramanga: filteredData.filter(u => u.ciudad.toLowerCase() === 'bucaramanga').length,
                bogota: filteredData.filter(u => u.ciudad.toLowerCase() === 'bogotá').length
            },
            porEstado: filteredData.reduce((acc, user) => {
                const estado = user.estado || (user.registrado ? 'Registrado' : 'No Registrado');
                acc[estado] = (acc[estado] || 0) + 1;
                return acc;
            }, {} as Record<string, number>)
        };
    }, [filteredData]);

    const updateFilters = (newFilters: Partial<UserFilter>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    return {
        filteredData,
        stats,
        filters,
        updateFilters
    };
};