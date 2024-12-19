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

const normalizarTelefono = (telefono: string | number | null): string | null => {
    if (!telefono) return null;
    
    // Convertir a string y eliminar todo lo que no sea número
    let numero = telefono.toString().replace(/\D/g, '');
    
    // Si empieza con 57, lo removemos
    if (numero.startsWith('57')) {
        numero = numero.substring(2);
    }
    
    // Si no empieza con 3 o no tiene 10 dígitos, no es un celular válido
    if (!numero.startsWith('3') || numero.length !== 10) {
        console.log('Número inválido:', telefono, '-> normalizado:', numero);
        return null;
    }
    
    return numero;
};

const readExcelFile = async (file: File): Promise<ChatData | StudentData[]> => {
    try {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, {
            cellDates: true,
            type: 'array'
        });

        console.log('Procesando archivo:', file.name);
        console.log('Hojas disponibles:', workbook.SheetNames);

        if (file.name.toLowerCase().includes('informecampi')) {
            const sheetName = workbook.SheetNames[1];
            if (!sheetName) {
                throw new Error('No se encontró la hoja de usuarios en el archivo informecampi');
            }

            const users = XLSX.utils.sheet_to_json<Record<string, any>>(workbook.Sheets[sheetName]);
            console.log(`Datos encontrados en ${file.name}:`, users.length);

            return {
                chat: [],
                users: users.map(user => ({
                    'User ID': Number(user['User ID']) || 0,
                    'Username': String(user['Username'] || user['nombre'] || ''),
                    'Phone Number': String(user['Phone Number'] || user['celular'] || ''),
                    'Age': typeof user['Age'] === 'number' ? user['Age'] : 
                          typeof user['edad'] === 'number' ? user['edad'] : null,
                    'Time': user['Time'] || user['fecha'] || new Date().toISOString()
                }))
            };
        } else if (file.name.toLowerCase().includes('estudiantes')) {
            const sheetName = workbook.SheetNames[0];
            const students = XLSX.utils.sheet_to_json<Record<string, any>>(workbook.Sheets[sheetName]);
            console.log(`Datos encontrados en ${file.name}:`, students.length);

            return students.map(student => ({
                Nombre: String(student['Nombre'] || ''),
                Celular: String(student['Celular'] || ''),
                Estado: String(student['Estado'] || ''),
                'Fecha registro': student['Fecha registro'] || new Date().toISOString()
            })) satisfies StudentData[];
        }

        throw new Error('Formato de archivo no reconocido');
    } catch (error) {
        console.error('Error al leer archivo Excel:', file.name, error);
        throw error;
    }
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

const procesarUsuarios = (chatData: ChatData, ciudad: string): UserData[] => {
    if (!chatData?.users?.length) {
        console.warn(`No se encontraron usuarios para ${ciudad}`);
        return [];
    }

    return chatData.users
        .map(user => {
            try {
                const celular = normalizarTelefono(user['Phone Number']);
                
                if (!celular) {
                    console.log('Usuario sin celular válido:', user);
                    return null;
                }

                const userData: UserData = {
                    userId: Number(user['User ID']) || 0,
                    nombre: String(user['Username'] || '').trim(),
                    edad: typeof user['Age'] === 'number' ? user['Age'] : null,
                    celular,
                    fecha: formatearFecha(user['Time']),
                    ciudad,
                    registrado: false,
                    estado: null
                };

                return userData;
            } catch (error) {
                console.error('Error procesando usuario:', user, error);
                return null;
            }
        })
        .filter((user): user is UserData => user !== null);
};

const procesarCiudad = (usuarios: UserData[], estudiantes: StudentData[]): CityAnalysis => {
    console.log(`Procesando ciudad con ${usuarios.length} usuarios y ${estudiantes.length} estudiantes`);
    
    // Normalizar teléfonos de estudiantes una sola vez
    const estudiantesMap = new Map(
        estudiantes
            .map(est => {
                const celular = normalizarTelefono(est.Celular);
                return celular ? [celular, est] : null;
            })
            .filter((x): x is [string, StudentData] => x !== null)
    );

    console.log(`Estudiantes con celular válido: ${estudiantesMap.size}`);

    // Marcar usuarios registrados
    usuarios.forEach(user => {
        if (!user.celular) return;
        
        const estudiante = estudiantesMap.get(user.celular);
        if (estudiante) {
            user.registrado = true;
            user.estado = estudiante.Estado;
            try {
                user.fechaRegistro = formatearFecha(estudiante['Fecha registro']);
            } catch (error) {
                console.warn('Error al formatear fecha de registro:', error);
            }
        }
    });

    const usuariosRegistrados = usuarios.filter(u => u.registrado);
    console.log(`Usuarios registrados encontrados: ${usuariosRegistrados.length}`);

    const stats = calcularEstadisticas(usuarios);
    
    // Conteo de estados
    const estados = Array.from(estudiantesMap.values()).reduce((acc, est) => {
        const estado = est.Estado || 'Sin Estado';
        acc[estado] = (acc[estado] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return {
        chatUsers: usuarios.length,
        validPhones: usuarios.filter(u => u.celular).length,
        registros: estudiantes.length,
        conversiones: usuariosRegistrados.length,
        tasaConversion: usuarios.length > 0 
            ? (usuariosRegistrados.length / usuarios.length) * 100 
            : 0,
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