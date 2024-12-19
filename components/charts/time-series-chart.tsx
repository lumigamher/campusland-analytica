'use client';

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { Card, CardContent } from '../ui/card';

interface TimeSeriesDataPoint {
    fecha: string;
    usuariosUnicos: number;
    totalInteracciones: number;
    tasaConversion: number;
}

interface TimeSeriesChartProps {
    data: TimeSeriesDataPoint[];
    title: string;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({ data, title }) => {
    return (
        <Card>
            <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">{title}</h3>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart 
                            data={data}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                                dataKey="fecha"
                                tickFormatter={(value) => {
                                    const date = new Date(value);
                                    return date.toLocaleDateString('es-CO', {
                                        day: '2-digit',
                                        month: 'short'
                                    });
                                }}
                            />
                            <YAxis 
                                yAxisId="left"
                                label={{ 
                                    value: 'Usuarios',
                                    angle: -90,
                                    position: 'insideLeft'
                                }}
                            />
                            <YAxis 
                                yAxisId="right" 
                                orientation="right"
                                label={{ 
                                    value: 'Tasa de Conversión (%)',
                                    angle: 90,
                                    position: 'insideRight'
                                }}
                            />
                            <Tooltip 
                                labelFormatter={(value) => {
                                    const date = new Date(value);
                                    return date.toLocaleDateString('es-CO', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    });
                                }}
                                formatter={(value: number) => [
                                    value.toLocaleString('es-CO'),
                                    ''
                                ]}
                            />
                            <Legend />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="usuariosUnicos"
                                name="Usuarios Únicos"
                                stroke="#2563eb"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="totalInteracciones"
                                name="Total Interacciones"
                                stroke="#93c5fd"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6 }}
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="tasaConversion"
                                name="Tasa de Conversión (%)"
                                stroke="#22c55e"
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};

export default TimeSeriesChart;
