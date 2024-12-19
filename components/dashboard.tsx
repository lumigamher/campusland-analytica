import React, { Suspense, useMemo } from 'react';
import { Users, MessageSquare, UserCheck, Calendar } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { ExportButton } from './export-button';
import { Filters } from './filters';
import { useStats } from './stats';
import { DashboardProps, MetricCardProps } from '../types';
import dynamic from 'next/dynamic';
import { UserTable } from '../components/user-table';


// Importaciones dinámicas corregidas
const ConversionChart = dynamic(
  () => import('./charts/conversion-chart'), 
  { ssr: false }
);

const StatusPieChart = dynamic(
  () => import('./charts/status-pie-chart'), 
  { ssr: false }
);

const TimeSeriesChart = dynamic(
  () => import('./charts/time-series-chart'), 
  { ssr: false }
);

const LoadingChart = () => (
  <div className="w-full h-64 bg-gray-100 animate-pulse rounded-lg" />
);

const MetricCard = ({ title, value, change, icon: Icon, trend }: MetricCardProps) => {
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

export default function Dashboard({ data }: DashboardProps) {
    const { 
        filteredData, 
        stats, 
        updateFilters 
    } = useStats(data);
    
    const handleDateChange = (start: string, end: string) => {
        updateFilters({ fechaInicio: start, fechaFin: end });
    };

    const handleCityChange = (city: string) => {
        updateFilters({ ciudad: city === 'todas' ? undefined : city });
    };

    const handleStatusChange = (status: string) => {
        updateFilters({ estado: status === 'todos' ? undefined : status });
    };

    // Datos para el gráfico de conversión
    const conversionData = useMemo(() => [
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
    ], [data]);

    // Datos para los gráficos de estado
    const bucaStatusData = useMemo(() => 
        Object.entries(data.bucaramanga.estados).map(([name, value]) => ({
            name,
            value: Number(value) // Asegurarse de que el valor es numérico
        })).filter(item => item.value > 0) // Filtrar valores cero
    , [data.bucaramanga.estados]);

    const bogStatusData = useMemo(() => 
        Object.entries(data.bogota.estados).map(([name, value]) => ({
            name,
            value: Number(value) // Asegurarse de que el valor es numérico
        })).filter(item => item.value > 0) // Filtrar valores cero
    , [data.bogota.estados]);
    
    const today = new Date().toISOString().split('T')[0];
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const todayUsers = useMemo(() => {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        return filteredData
            .filter(user => {
                const userDate = new Date(user.fecha);
                return userDate >= startOfDay;
            })
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    }, [filteredData]);

    const timeSeriesChart = useMemo(() => {
        // Verificar que tenemos los datos necesarios
        if (!data.global.dailyStats) return [];
    
        return data.global.dailyStats.map(stat => ({
            fecha: stat.fecha,
            usuariosUnicos: stat.usuariosUnicos || 0,
            totalInteracciones: stat.totalInteracciones || 0,
            tasaConversion: parseFloat((stat.tasaConversion || 0).toFixed(2))
        }));
    }, [data.global.dailyStats]);
    
    const monthUsers = useMemo(() => {
        const startOfMonth = new Date();
        startOfMonth.setMonth(startOfMonth.getMonth() - 1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        return filteredData
            .filter(user => {
                const userDate = new Date(user.fecha);
                return userDate >= startOfMonth;
            })
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    }, [filteredData]);

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
                    change={`${data.global.tasaConversionGlobal}%`}
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
                <Suspense fallback={<LoadingChart />}>
                    <div className="w-full">
                        <ConversionChart data={conversionData} />
                    </div>
                </Suspense>
                
                <div className="grid grid-rows-2 gap-8">
                    <Suspense fallback={<LoadingChart />}>
                        <div className="w-full">
                            <StatusPieChart 
                                data={bucaStatusData} 
                                title="Estados en Bucaramanga" 
                            />
                        </div>
                    </Suspense>
                    <Suspense fallback={<LoadingChart />}>
                        <div className="w-full">
                            <StatusPieChart 
                                data={bogStatusData} 
                                title="Estados en Bogotá" 
                            />
                        </div>
                    </Suspense>
                </div>
            </div>

            <Suspense fallback={<LoadingChart />}>
                <div className="w-full">
                    <TimeSeriesChart
                        data={timeSeriesChart}
                        title="Evolución Diaria de Usuarios"
                    />
                </div>
            </Suspense>

            <div className="space-y-8 mt-8">
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-xl font-semibold mb-4">Usuarios del Día ({todayUsers.length})</h3>
                        <UserTable 
                            users={todayUsers}
                            title="Usuarios del Día"
                            description="Usuarios que han interactuado hoy con el asistente"
                        />
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-6">
                        <h3 className="text-xl font-semibold mb-4">Usuarios del Mes ({monthUsers.length})</h3>
                        <UserTable 
                            users={monthUsers}
                            title="Usuarios del Mes"
                            description="Usuarios que han interactuado en el último mes"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
