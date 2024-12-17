export interface AnalysisResult {
    bucaramanga: CityAnalysis;
    bogota: CityAnalysis;
    global: GlobalAnalysis;
}

export interface CityAnalysis {
    chatUsers: number;
    validPhones: number;
    registros: number;
    conversiones: number;
    tasaConversion: number;
    estados: Record<string, number>;
}

export interface GlobalAnalysis {
    totalChatUsers: number;
    totalValidPhones: number;
    totalConversiones: number;
    totalRegistros: number;
    tasaConversionGlobal: number;
}