'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { ArrowUpRight, ArrowDownRight, Users, MessageSquare, UserCheck } from 'lucide-react';
import type { AnalysisResult } from '../types';

interface DashboardProps {
    data: AnalysisResult;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
    const conversionData = [
        {
            ciudad: 'Bucaramanga',
            usuarios: data.bucaramanga.chatUsers,
            telefonos: data.bucaramanga.validPhones,
            conversiones: data.bucaramanga.conversiones
        },
        {
            ciudad: 'Bogotá',
            usuarios: data.bogota.chatUsers,
            telefonos: data.bogota.validPhones,
            conversiones: data.bogota.conversiones
        }
    ];

    const estadosBucaData = Object.entries(data.bucaramanga.estados).map(([name, value]) => ({
        name,
        value
    }));

    const estadosBogData = Object.entries(data.bogota.estados).map(([name, value]) => ({
        name,
        value
    }));

    const MetricCard = ({ title, value, change, icon: Icon, trend }: {
        title: string;
        value: number | string;
        change: string;
        icon: any;
        trend: 'up' | 'down';
    }) => (
        <Card className="overflow-hidden">
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <p className="text-base md:text-lg text-gray-600">{title}</p>
                        <h3 className="text-2xl md:text-4xl font-bold">{value}</h3>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <Icon className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="mt-4">
                    <span className={`text-base md:text-lg ${trend === 'up' ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
                        {trend === 'up' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                        {change}
                    </span>
                </div>
            </CardContent>
        </Card>
    );

    const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 1.6;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text 
                x={x} 
                y={y} 
                fill="black" 
                textAnchor={x > cx ? 'start' : 'end'} 
                dominantBaseline="central"
                className="text-base md:text-lg font-medium"
            >
                {`${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
            </text>
        );
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl md:text-4xl font-bold mb-8">Dashboard de Conversión ChatBot</h1>

            {/* Métricas Globales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="Total Usuarios Chat"
                    value={data.global.totalChatUsers}
                    change="Total global"
                    icon={Users}
                    trend="up"
                />
                <MetricCard
                    title="Teléfonos Válidos"
                    value={data.global.totalValidPhones}
                    change="Del total de usuarios"
                    icon={MessageSquare}
                    trend="up"
                />
                <MetricCard
                    title="Total Conversiones"
                    value={data.global.totalConversiones}
                    change={`${data.global.tasaConversionGlobal.toFixed(2)}%`}
                    icon={UserCheck}
                    trend="up"
                />
                <MetricCard
                    title="Total Registros"
                    value={data.global.totalRegistros}
                    change="En ambas ciudades"
                    icon={Users}
                    trend="up"
                />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gráfico de Conversión */}
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader className="p-6">
                        <CardTitle className="text-2xl md:text-3xl">Conversión por Ciudad</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px] md:h-[500px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={conversionData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="ciudad" 
                                        tick={{ fontSize: 16 }}
                                        height={60}
                                    />
                                    <YAxis 
                                        tick={{ fontSize: 14 }} 
                                        width={80}
                                    />
                                    <Tooltip 
                                        contentStyle={{ fontSize: '14px' }} 
                                        labelStyle={{ fontSize: '16px' }}
                                    />
                                    <Legend 
                                        verticalAlign="bottom" 
                                        height={36}
                                        wrapperStyle={{ fontSize: '16px' }}
                                    />
                                    <Bar name="Usuarios Chat" dataKey="usuarios" fill="#0088FE" />
                                    <Bar name="Teléfonos Válidos" dataKey="telefonos" fill="#00C49F" />
                                    <Bar name="Conversiones" dataKey="conversiones" fill="#FFBB28" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Estados por Ciudad */}
                <Card>
                    <CardHeader className="p-6">
                        <CardTitle className="text-2xl md:text-3xl">Estados en Bucaramanga</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px] md:h-[500px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={estadosBucaData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={CustomLabel}
                                        outerRadius={140}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {estadosBucaData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ fontSize: '14px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="p-6">
                        <CardTitle className="text-2xl md:text-3xl">Estados en Bogotá</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px] md:h-[500px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={estadosBogData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={CustomLabel}
                                        outerRadius={140}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {estadosBogData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ fontSize: '14px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detalles adicionales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <Card>
                    <CardHeader className="p-6">
                        <CardTitle className="text-2xl md:text-3xl">Detalles Bucaramanga</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 text-base md:text-lg">
                            <p><span className="font-semibold">Usuarios Chat:</span> {data.bucaramanga.chatUsers}</p>
                            <p><span className="font-semibold">Teléfonos Válidos:</span> {data.bucaramanga.validPhones}</p>
                            <p><span className="font-semibold">Registros:</span> {data.bucaramanga.registros}</p>
                            <p><span className="font-semibold">Conversiones:</span> {data.bucaramanga.conversiones}</p>
                            <p><span className="font-semibold">Tasa de Conversión:</span> {data.bucaramanga.tasaConversion.toFixed(2)}%</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="p-6">
                        <CardTitle className="text-2xl md:text-3xl">Detalles Bogotá</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 text-base md:text-lg">
                            <p><span className="font-semibold">Usuarios Chat:</span> {data.bogota.chatUsers}</p>
                            <p><span className="font-semibold">Teléfonos Válidos:</span> {data.bogota.validPhones}</p>
                            <p><span className="font-semibold">Registros:</span> {data.bogota.registros}</p>
                            <p><span className="font-semibold">Conversiones:</span> {data.bogota.conversiones}</p>
                            <p><span className="font-semibold">Tasa de Conversión:</span> {data.bogota.tasaConversion.toFixed(2)}%</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;