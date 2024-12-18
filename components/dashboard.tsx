'use client';

import React from 'react';
import { Users, MessageSquare, UserCheck, Calendar } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { ExportButton } from './export-button';
import { Filters } from './filters';
import { useStats } from './stats';


// MetricCard component definition
const MetricCard = ({ title, value, change, icon: Icon, trend }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold mt-2">{value}</h3>
            <p className="text-sm text-gray-600 mt-1">{change}</p>
          </div>
          <div className="p-2 bg-primary/10 rounded-full">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Chart components
const ConversionChart = ({ data }) => (
  <Card>
    <CardContent className="p-6">
      <h3 className="text-lg font-semibold mb-4">Conversión por Ciudad</h3>
      {/* Implement your chart here using recharts */}
    </CardContent>
  </Card>
);

const StatusPieChart = ({ data, title }) => (
  <Card>
    <CardContent className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {/* Implement your pie chart here using recharts */}
    </CardContent>
  </Card>
);

const TimeSeriesChart = ({ data, title }) => (
  <Card>
    <CardContent className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      {/* Implement your time series chart here using recharts */}
    </CardContent>
  </Card>
);

export const Dashboard = ({ data }) => {
    const { 
        filteredData, 
        stats, 
        updateFilters 
    } = useStats(data);

    const handleDateChange = (start, end) => {
        updateFilters({ fechaInicio: start, fechaFin: end });
    };

    const handleCityChange = (city) => {
        updateFilters({ ciudad: city === 'todas' ? undefined : city });
    };

    const handleStatusChange = (status) => {
        updateFilters({ estado: status === 'todos' ? undefined : status });
    };

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

    const getBucaStatusData = Object.entries(data.bucaramanga.estados).map(([name, value]) => ({
        name,
        value
    }));

    const getBogStatusData = Object.entries(data.bogota.estados).map(([name, value]) => ({
        name,
        value
    }));

    const today = new Date().toISOString().split('T')[0];
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const todayUsers = filteredData.filter(user => 
        user.fecha.startsWith(today)
    );

    const monthUsers = filteredData.filter(user => 
        new Date(user.fecha) >= lastMonth
    );

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl md:text-4xl font-bold">Informe ISA - Asistente Virtual CampusLand</h1>
                <ExportButton data={data} />
            </div>

            <Filters
                onDateChange={handleDateChange}
                onCityChange={handleCityChange}
                onStatusChange={handleStatusChange}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="Total Interacciones"
                    value={data.global.totalChatUsers}
                    change={`${((stats.total / data.global.totalChatUsers) * 100).toFixed(1)}%`}
                    icon={Users}
                    trend="up"
                />
                <MetricCard
                    title="Usuarios con Teléfono"
                    value={data.global.totalValidPhones}
                    change={`${((data.global.totalValidPhones / data.global.totalChatUsers) * 100).toFixed(1)}%`}
                    icon={MessageSquare}
                    trend="up"
                />
                <MetricCard
                    title="Conversiones"
                    value={data.global.totalConversiones}
                    change={`${data.global.tasaConversionGlobal.toFixed(1)}%`}
                    icon={UserCheck}
                    trend="up"
                />
                <MetricCard
                    title="Registros Totales"
                    value={data.global.totalRegistros}
                    change="Total acumulado"
                    icon={Calendar}
                    trend="up"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <ConversionChart data={conversionData} />
                
                <div className="grid grid-rows-2 gap-8">
                    <StatusPieChart 
                        data={getBucaStatusData} 
                        title="Estados en Bucaramanga" 
                    />
                    <StatusPieChart 
                        data={getBogStatusData} 
                        title="Estados en Bogotá" 
                    />
                </div>
            </div>

            <TimeSeriesChart
                data={data.global.dailyStats}
                title="Evolución Diaria de Usuarios"
            />

            <div className="space-y-8">
                <Card>
                    <CardContent>
                        <h3 className="text-xl font-semibold mb-4">Usuarios del Día ({todayUsers.length})</h3>
                        {/* Implement user table here */}
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent>
                        <h3 className="text-xl font-semibold mb-4">Usuarios del Mes ({monthUsers.length})</h3>
                        {/* Implement user table here */}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}