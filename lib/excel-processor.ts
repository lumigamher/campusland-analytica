import * as XLSX from 'xlsx';
import { 
    AnalysisResult,
    ChatData,
    StudentData,
    UserData,
    DailyStats,
    MonthlyStats,
    ProcessedStats,
    CityAnalysis,
    GlobalAnalysis
} from '../types';

const normalizarTelefono = (telefono: string | number | null): string | null => {
    if (!telefono) return null;
    let numero = telefono.toString().replace(/\D/g, '');
    if (numero.startsWith('57')) {
        numero = numero.substring(2);
    }
    return numero.length === 10 && numero.startsWith('3') ? numero : null;
};

const formatearFecha = (fecha: string | number | Date): string => {
    try {
        if (typeof fecha === 'number') {
            // Convertir número de serie de Excel a fecha
            const excelDate = XLSX.SSF.parse_date_code(fecha);
            return new Date(
                excelDate.y,
                excelDate.m - 1,
                excelDate.d,
                excelDate.H || 0,
                excelDate.M || 0,
                excelDate.S || 0
            ).toISOString();
        }

        const dateObj = fecha instanceof Date ? fecha : new Date(fecha);
        if (isNaN(dateObj.getTime())) {
            throw new Error('Fecha inválida');
        }
        return dateObj.toISOString();
    } catch (error) {
        console.error('Error al formatear fecha:', fecha, error);
        return new Date().toISOString();
    }
};

const procesarUsuarios = (chatData: ChatData, ciudad: string): UserData[] => {
    return chatData.users.map(user => {
        try {
            return {
                userId: user['User ID'],
                nombre: user['Username'],
                edad: typeof user['Age'] === 'number' ? user['Age'] : null,
                celular: normalizarTelefono(user['Phone Number']) || '',
                fecha: formatearFecha(user['Time']),
                ciudad,
                registrado: false
            } as UserData;
        } catch (error) {
            console.error('Error al procesar usuario:', user, error);
            return null;
        }
    }).filter((user): user is UserData => user !== null);
};

const calcularEstadisticas = (usuarios: UserData[]): ProcessedStats => {
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
        try {
            const fecha = new Date(user.fecha);
            if (isNaN(fecha.getTime())) return;

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
        } catch (error) {
            console.error('Error al procesar estadísticas para usuario:', user, error);
        }
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
                tasaConversion: value.usuarios.size > 0 ? 
                    (value.conversiones / value.usuarios.size) * 100 : 0
            })) as T[];
    };

    return {
        daily: processStats<DailyStats>(dailyStats, 'daily'),
        monthly: processStats<MonthlyStats>(monthlyStats, 'monthly')
    };
};

const procesarCiudad = (
    usuarios: UserData[],
    estudiantes: StudentData[]
): CityAnalysis => {
    const telefonosRegistrados = new Set(
        estudiantes.map(e => normalizarTelefono(e.Celular)).filter(Boolean)
    );

    // Marcar usuarios registrados y asignar estados
    usuarios.forEach(user => {
        if (user.celular && telefonosRegistrados.has(user.celular)) {
            user.registrado = true;
            const estudiante = estudiantes.find(e => 
                normalizarTelefono(e.Celular) === user.celular
            );
            if (estudiante) {
                user.estado = estudiante.Estado;
                try {
                    user.fechaRegistro = formatearFecha(estudiante['Fecha registro']);
                } catch (error) {
                    console.warn('Error al formatear fecha de registro:', estudiante['Fecha registro']);
                }
            }
        }
    });

    const stats = calcularEstadisticas(usuarios);
    const estados = estudiantes.reduce((acc: Record<string, number>, e) => {
        const estado = e.Estado || 'Sin Estado';
        acc[estado] = (acc[estado] || 0) + 1;
        return acc;
    }, {});

    return {
        chatUsers: usuarios.length,
        validPhones: usuarios.filter(u => u.celular).length,
        registros: estudiantes.length,
        conversiones: usuarios.filter(u => u.registrado).length,
        tasaConversion: usuarios.length > 0 ? 
            (usuarios.filter(u => u.registrado).length / usuarios.length) * 100 : 0,
        estados,
        dailyStats: stats.daily,
        monthlyStats: stats.monthly,
        usuarios
    };
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
                dateNF: 'yyyy-mm-dd hh:mm:ss',
                cellNF: true,
                cellText: false
            });

            if (file.name.toLowerCase().includes('informe')) {
                const chat = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
                    raw: false,
                    dateNF: 'yyyy-mm-dd hh:mm:ss'
                }) as ChatData['chat'];
                const users = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[1]], {
                    raw: false,
                    dateNF: 'yyyy-mm-dd hh:mm:ss'
                }) as ChatData['users'];
                return { chat, users };
            } else {
                return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
                    raw: false,
                    dateNF: 'yyyy-mm-dd'
                }) as StudentData[];
            }
        } catch (error) {
            console.error('Error al leer archivo Excel:', error, file.name);
            throw new Error(`Error al procesar el archivo ${file.name}: ${error.message}`);
        }
    };

    try {
        const [chatBuca, chatBog, estBuca, estBog] = await Promise.all([
            readExcelFile(chatBucaFile) as Promise<ChatData>,
            readExcelFile(chatBogFile) as Promise<ChatData>,
            readExcelFile(estBucaFile) as Promise<StudentData[]>,
            readExcelFile(estBogFile) as Promise<StudentData[]>
        ]);

        const usuariosBuca = procesarUsuarios(chatBuca, 'Bucaramanga');
        const usuariosBog = procesarUsuarios(chatBog, 'Bogotá');

        const bucaramanga = procesarCiudad(usuariosBuca, estBuca);
        const bogota = procesarCiudad(usuariosBog, estBog);

        const statsGlobal = calcularEstadisticas([...usuariosBuca, ...usuariosBog]);

        const global: GlobalAnalysis = {
            totalChatUsers: bucaramanga.chatUsers + bogota.chatUsers,
            totalValidPhones: bucaramanga.validPhones + bogota.validPhones,
            totalConversiones: bucaramanga.conversiones + bogota.conversiones,
            totalRegistros: bucaramanga.registros + bogota.registros,
            tasaConversionGlobal: (bucaramanga.conversiones + bogota.conversiones) / 
                (bucaramanga.chatUsers + bogota.chatUsers) * 100,
            dailyStats: statsGlobal.daily,
            monthlyStats: statsGlobal.monthly
        };

        return {
            bucaramanga,
            bogota,
            global
        };
    } catch (error) {
        console.error('Error en el procesamiento:', error);
        throw new Error(error instanceof Error ? error.message : 'Error al procesar los archivos Excel');
    }
};