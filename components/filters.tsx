'use client';

import React from 'react';
import { Card, CardContent } from './ui/card';
import { CalendarIcon, Filter } from 'lucide-react';

interface FiltersProps {
    onDateChange: (startDate: string, endDate: string) => void;
    onCityChange: (city: string) => void;
    onStatusChange: (status: string) => void;
}

export const Filters: React.FC<FiltersProps> = ({
    onDateChange,
    onCityChange,
    onStatusChange
}) => {
    const [dateRange, setDateRange] = React.useState({
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    const handleDateChange = (type: 'start' | 'end', value: string) => {
        const newRange = { ...dateRange, [type]: value };
        setDateRange(newRange);
        onDateChange(newRange.start, newRange.end);
    };

    return (
        <Card className="mb-6">
            <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => handleDateChange('start', e.target.value)}
                                className="border rounded px-2 py-1 text-sm"
                            />
                            <span>a</span>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => handleDateChange('end', e.target.value)}
                                className="border rounded px-2 py-1 text-sm"
                            />
                        </div>
                    </div>

                    <select
                        onChange={(e) => onCityChange(e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                        defaultValue="todas"
                    >
                        <option value="todas">Todas las ciudades</option>
                        <option value="bucaramanga">Bucaramanga</option>
                        <option value="bogota">Bogotá</option>
                    </select>

                    <select
                        onChange={(e) => onStatusChange(e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                        defaultValue="todos"
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="registrado">Registrados</option>
                        <option value="no_registrado">No Registrados</option>
                        <option value="preseleccionado">Preseleccionados</option>
                        <option value="agendado">Agendados</option>
                        <option value="admitido">Admitidos</option>
                    </select>

                    <button 
                        className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                        onClick={() => {
                            setDateRange({
                                start: new Date().toISOString().split('T')[0],
                                end: new Date().toISOString().split('T')[0]
                            });
                            onCityChange('todas');
                            onStatusChange('todos');
                        }}
                    >
                        <Filter className="w-4 h-4" />
                        Limpiar filtros
                    </button>
                </div>
            </CardContent>
        </Card>
    );
};