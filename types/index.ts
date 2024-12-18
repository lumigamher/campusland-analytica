import { LucideIcon } from 'lucide-react';

// Interfaces básicas de datos
export interface UserData {
    userId: number;
    nombre: string;
    edad?: number | null;
    celular: string;
    fecha: string;
    fechaRegistro?: string;
    estado?: string;
    ciudad: string;
    registrado: boolean;
}

export interface UserFilter {
    fechaInicio?: string | Date;
    fechaFin?: string | Date;
    ciudad?: string;
    estado?: string;
}

export interface ChatData {
    chat: {
        'User ID': number;
        'Message': string;
        'ID': number;
        'Time': string;
    }[];
    users: {
        'User ID': number;
        'Username': string;
        'Phone Number': string | number;
        'Age'?: number;
        'Time': string;
    }[];
}

export interface StudentData {
    Nombre: string;
    Celular: string | number;
    Estado: string;
    'Fecha registro': string;
}

// Interfaces de Estadísticas
export interface DailyStats {
    fecha: string;
    totalInteracciones: number;
    usuariosUnicos: number;
    conversiones: number;
    tasaConversion: number;
}

export interface MonthlyStats {
    mes: string;
    totalInteracciones: number;
    usuariosUnicos: number;
    conversiones: number;
    tasaConversion: number;
}

export interface CityAnalysis {
    chatUsers: number;
    validPhones: number;
    registros: number;
    conversiones: number;
    tasaConversion: number;
    estados: Record<string, number>;
    dailyStats: DailyStats[];
    monthlyStats: MonthlyStats[];
    usuarios: UserData[];
}

export interface GlobalAnalysis {
    totalChatUsers: number;
    totalValidPhones: number;
    totalConversiones: number;
    totalRegistros: number;
    tasaConversionGlobal: number;
    dailyStats: DailyStats[];
    monthlyStats: MonthlyStats[];
}

export interface AnalysisResult {
    bucaramanga: CityAnalysis;
    bogota: CityAnalysis;
    global: GlobalAnalysis;
}

// Interfaces de Componentes
export interface MetricCardProps {
    title: string;
    value: number | string;
    change: string;
    icon: LucideIcon;
    trend: 'up' | 'down';
    description?: string;
}

export interface StatsCardProps {
    title: string;
    value: number | string;
    percentage?: number;
    trend?: 'up' | 'down';
    icon?: LucideIcon;
    description?: string;
}

export interface DashboardProps {
    data: AnalysisResult;
}

export interface FiltersProps {
    onDateChange: (start: string, end: string) => void;
    onCityChange: (city: string) => void;
    onStatusChange: (status: string) => void;
}

export interface UploadFormProps {
    onFilesSelected: (files: {
        chatBuca: File;
        chatBog: File;
        estBuca: File;
        estBog: File;
    }) => void;
    isLoading?: boolean;
}

export interface UserTableProps {
    users: UserData[];
    title: string;
    description?: string;
}

// Interfaces para Gráficos
export interface ChartData {
    name: string;
    value: number;
    color?: string;
}

export interface ConversionChartProps {
    data: {
        ciudad: string;
        usuarios: number;
        telefonos: number;
        conversiones: number;
    }[];
}

export interface StatusPieChartProps {
    data: ChartData[];
    title: string;
}

export interface TimeSeriesChartProps {
    data: DailyStats[];
    title: string;
}

export interface CustomLabelProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    value: number;
    name: string;
}

export interface BarChartCustomLabelProps {
    x: number;
    y: number;
    width: number;
    height: number;
    value: number;
}

// Interfaces de Procesamiento
export interface ProcessedStats {
    daily: DailyStats[];
    monthly: MonthlyStats[];
}

export interface FileReaderResult {
    success: boolean;
    data?: any;
    error?: string;
}

// Tipos de Utilidad
export type StatsType = 'daily' | 'monthly';
export type TrendType = 'up' | 'down';
export type CityType = 'bucaramanga' | 'bogota';

// Estados y Enums
export enum UserStatus {
    REGISTRADO = 'Registrado',
    PRESELECCIONADO = 'Preseleccionado',
    AGENDADO = 'Agendado',
    ADMITIDO = 'Admitido',
    NO_REGISTRADO = 'No Registrado'
}

export enum LoadingState {
    IDLE = 'idle',
    LOADING = 'loading',
    SUCCESS = 'success',
    ERROR = 'error'
}

// Tipos para manejo de errores
export interface AppError {
    message: string;
    code?: string;
    details?: any;
}

// Interfaces adicionales para componentes específicos
export interface ExportButtonProps {
    data: AnalysisResult;
}

export interface StatsContextData {
    filteredData: UserData[];
    stats: {
        total: number;
        registrados: number;
        noRegistrados: number;
        tasaConversion: number;
        porCiudad: {
            bucaramanga: number;
            bogota: number;
        };
        porEstado: Record<string, number>;
    };
    filters: UserFilter;
    updateFilters: (newFilters: Partial<UserFilter>) => void;
}

// Hook types
export interface UseStats {
    filteredData: UserData[];
    stats: {
        total: number;
        registrados: number;
        noRegistrados: number;
        tasaConversion: number;
        porCiudad: {
            bucaramanga: number;
            bogota: number;
        };
        porEstado: Record<string, number>;
    };
    filters: UserFilter;
    updateFilters: (newFilters: Partial<UserFilter>) => void;
}