import * as XLSX from 'xlsx';
import { 
    AnalysisResult, 
    ChatData, 
    StudentData, 
    UserData,
    DailyStats,
    MonthlyStats,
    ProcessedStats
} from '../types';

const normalizarTelefono = (telefono: string | number | null): string | null => {
    if (!telefono) return null;
    let numero = telefono.toString().replace(/\D/g, '');
    if (numero.startsWith('57')) {
        numero = numero.substring(2);
    }
    return numero.length === 10 && numero.startsWith('3') ? numero : null;
};

const procesarUsuarios = (chatData: ChatData, ciudad: string): UserData[] => {
    return chatData.users.map(user => ({
        userId: user['User ID'],
        nombre: user['Username'],
        edad: user['Age'] || null,
        celular: normalizarTelefono(user['Phone Number']) || '',
        fecha: user['Time'],
        ciudad,
        registrado: false,
        estado: undefined
    }));
};

const calcularEstadisticas = (usuarios: UserData[], totalRegistros: number): ProcessedStats => {
    const dailyStats = new Map<string, {
        interacciones: number;
        usuarios: Set<number>;
        conversiones: number;
    }>();

    const monthlyStats = new Map<string, {
        interacciones: number;
        usuarios: Set<number>;
        conversiones: number;
    }>();

    usuarios.forEach(user => {
        const fecha = new Date(user.fecha);
        const diaKey = fecha.toISOString().split('T')[0];
        const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;

        // Estadísticas diarias
        if (!dailyStats.has(diaKey)) {
            dailyStats.set(diaKey, {
                interacciones: 0,
                usuarios: new Set(),
                conversiones: 0
            });
        }
        const diaStats = dailyStats.get(diaKey)!;
        diaStats.interacciones++;
        diaStats.usuarios.add(user.userId);
        if (user.registrado) diaStats.conversiones++;

        // Estadísticas mensuales
        if (!monthlyStats.has(mesKey)) {
            monthlyStats.set(mesKey, {
                interacciones: 0,
                usuarios: new Set(),
                conversiones: 0
            });
        }
        const mesStats = monthlyStats.get(mesKey)!;
        mesStats.interacciones++;
        mesStats.usuarios.add(user.userId);
        if (user.registrado) mesStats.conversiones++;
    });

    const processStats = <T extends DailyStats | MonthlyStats>(
        stats: Map<string, any>,
        type: 'daily' | 'monthly'
    ): T[] => {
        return Array.from(stats.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => ({
                [type === 'daily' ? 'fecha' : 'mes']: key,
                totalInteracciones: value.interacciones,
                usuariosUnicos: value.usuarios.size,
                conversiones: value.conversiones,
                tasaConversion: (value.conversiones / value.usuarios.size) * 100
            })) as T[];
    };

    return {
        daily: processStats<DailyStats>(dailyStats, 'daily'),
        monthly: processStats<MonthlyStats>(monthlyStats, 'monthly')
    };
};

const getEstados = (estudiantes: StudentData[]): Record<string, number> => {
    return estudiantes.reduce((acc: Record<string, number>, e) => {
        const estado = e.Estado || 'Sin Estado';
        acc[estado] = (acc[estado] || 0) + 1;
        return acc;
    }, {});
};

export const processExcelFiles = async (
    chatBucaFile: File,
    chatBogFile: File,
    estBucaFile: File,
    estBogFile: File
): Promise<AnalysisResult> => {
    const readExcelFile = async (file: File): Promise<ChatData | StudentData[]> => {
        try {
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, {
                cellDates: true,
                cellNF: true,
                cellText: true
            });

            if (file.name.toLowerCase().includes('informe')) {
                // Es un archivo de chat
                const chat = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
                const users = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[1]]);
                return { chat, users } as ChatData;
            } else {
                // Es un archivo de estudiantes
                return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) as StudentData[];
            }
        } catch (error) {
            console.error('Error al leer archivo Excel:', error);
            throw new Error(`Error al procesar el archivo ${file.name}`);
        }
    };

    try {
        // Leer todos los archivos
        const [chatBuca, chatBog, estBuca, estBog] = await Promise.all([
            readExcelFile(chatBucaFile) as Promise<ChatData>,
            readExcelFile(chatBogFile) as Promise<ChatData>,
            readExcelFile(estBucaFile) as Promise<StudentData[]>,
            readExcelFile(estBogFile) as Promise<StudentData[]>
        ]);

        // Procesar usuarios
        const usuariosBuca = procesarUsuarios(chatBuca, 'Bucaramanga');
        const usuariosBog = procesarUsuarios(chatBog, 'Bogotá');

        // Procesar teléfonos registrados
        const telefonosRegBuca = new Set(
            estBuca.map(e => normalizarTelefono(e.Celular)).filter(Boolean)
        );
        const telefonosRegBog = new Set(
            estBog.map(e => normalizarTelefono(e.Celular)).filter(Boolean)
        );

        // Marcar usuarios registrados y asignar estados
        usuariosBuca.forEach(user => {
            if (user.celular && telefonosRegBuca.has(user.celular)) {
                user.registrado = true;
                const estudiante = estBuca.find(e => 
                    normalizarTelefono(e.Celular) === user.celular
                );
                if (estudiante) {
                    user.estado = estudiante.Estado;
                    user.fechaRegistro = estudiante['Fecha registro'];
                }
            }
        });

        usuariosBog.forEach(user => {
            if (user.celular && telefonosRegBog.has(user.celular)) {
                user.registrado = true;
                const estudiante = estBog.find(e => 
                    normalizarTelefono(e.Celular) === user.celular
                );
                if (estudiante) {
                    user.estado = estudiante.Estado;
                    user.fechaRegistro = estudiante['Fecha registro'];
                }
            }
        });

        // Calcular estadísticas
        const statsBuca = calcularEstadisticas(usuariosBuca, estBuca.length);
        const statsBog = calcularEstadisticas(usuariosBog, estBog.length);
        const statsGlobal = calcularEstadisticas(
            [...usuariosBuca, ...usuariosBog],
            estBuca.length + estBog.length
        );

        // Obtener estados
        const estadosBuca = getEstados(estBuca);
        const estadosBog = getEstados(estBog);

        // Construir resultado final
        return {
            bucaramanga: {
                chatUsers: usuariosBuca.length,
                validPhones: usuariosBuca.filter(u => u.celular).length,
                registros: estBuca.length,
                conversiones: usuariosBuca.filter(u => u.registrado).length,
                tasaConversion: (usuariosBuca.filter(u => u.registrado).length / usuariosBuca.length) * 100,
                estados: estadosBuca,
                dailyStats: statsBuca.daily,
                monthlyStats: statsBuca.monthly,
                usuarios: usuariosBuca
            },
            bogota: {
                chatUsers: usuariosBog.length,
                validPhones: usuariosBog.filter(u => u.celular).length,
                registros: estBog.length,
                conversiones: usuariosBog.filter(u => u.registrado).length,
                tasaConversion: (usuariosBog.filter(u => u.registrado).length / usuariosBog.length) * 100,
                estados: estadosBog,
                dailyStats: statsBog.daily,
                monthlyStats: statsBog.monthly,
                usuarios: usuariosBog
            },
            global: {
                totalChatUsers: usuariosBuca.length + usuariosBog.length,
                totalValidPhones: usuariosBuca.filter(u => u.celular).length + usuariosBog.filter(u => u.celular).length,
                totalConversiones: usuariosBuca.filter(u => u.registrado).length + usuariosBog.filter(u => u.registrado).length,
                totalRegistros: estBuca.length + estBog.length,
                tasaConversionGlobal: ((usuariosBuca.filter(u => u.registrado).length + usuariosBog.filter(u => u.registrado).length) / 
                    (usuariosBuca.length + usuariosBog.length)) * 100,
                dailyStats: statsGlobal.daily,
                monthlyStats: statsGlobal.monthly
            }
        };
    } catch (error) {
        console.error('Error en el procesamiento:', error);
        throw new Error(error instanceof Error ? error.message : 'Error al procesar los archivos Excel');
    }
};