import * as XLSX from 'xlsx';
import { AnalysisResult } from '../types';

interface ChatUser {
    'User ID': number;
    'Phone Number': string | number;
    Username: string;
}

interface ChatData {
    chat: unknown[];
    users: ChatUser[];
}

interface StudentData {
    Nombre: string;
    Celular: string | number;
    Estado: string;
    'Fecha registro': string;
}

const normalizarTelefono = (telefono: string | number | null): string | null => {
    if (!telefono) return null;
    let numero = telefono.toString().replace(/\D/g, '');
    if (numero.startsWith('57')) {
        numero = numero.substring(2);
    }
    return numero.length === 10 && numero.startsWith('3') ? numero : null;
};

export const processExcelFiles = async (
    chatBucaFile: File,
    chatBogFile: File,
    estBucaFile: File,
    estBogFile: File
): Promise<AnalysisResult> => {
    const readExcelFile = async (file: File, isChat: boolean = false): Promise<ChatData | StudentData[]> => {
        try {
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, {
                cellDates: true,
                cellNF: true,
                cellText: true
            });

            if (isChat) {
                return {
                    chat: XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]),
                    users: XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[1]]) as ChatUser[]
                };
            } else {
                return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]) as StudentData[];
            }
        } catch (error) {
            console.error('Error al leer archivo Excel:', error);
            throw new Error('Error al leer archivo Excel. Verifica el formato del archivo.');
        }
    };

    try {
        // Leer todos los archivos
        const [chatBuca, chatBog, estBuca, estBog] = await Promise.all([
            readExcelFile(chatBucaFile, true) as Promise<ChatData>,
            readExcelFile(chatBogFile, true) as Promise<ChatData>,
            readExcelFile(estBucaFile) as Promise<StudentData[]>,
            readExcelFile(estBogFile) as Promise<StudentData[]>
        ]);

        // Procesar teléfonos del chat
        const telefonosChatBuca = new Set(
            chatBuca.users
                .map(u => normalizarTelefono(u['Phone Number']))
                .filter((t): t is string => t !== null)
        );

        const telefonosChatBog = new Set(
            chatBog.users
                .map(u => normalizarTelefono(u['Phone Number']))
                .filter((t): t is string => t !== null)
        );

        // Procesar teléfonos de estudiantes
        const telefonosRegBuca = new Set(
            estBuca
                .map(e => normalizarTelefono(e.Celular))
                .filter((t): t is string => t !== null)
        );

        const telefonosRegBog = new Set(
            estBog
                .map(e => normalizarTelefono(e.Celular))
                .filter((t): t is string => t !== null)
        );

        // Encontrar coincidencias
        const coincidenciasBuca = [...telefonosChatBuca]
            .filter(t => telefonosRegBuca.has(t));

        const coincidenciasBog = [...telefonosChatBog]
            .filter(t => telefonosRegBog.has(t));

        // Calcular estados
        const getEstados = (estudiantes: StudentData[], coincidencias: string[]) => {
            return estudiantes
                .filter(e => {
                    const telefono = normalizarTelefono(e.Celular);
                    return telefono && coincidencias.includes(telefono);
                })
                .reduce<Record<string, number>>((acc, e) => {
                    acc[e.Estado] = (acc[e.Estado] || 0) + 1;
                    return acc;
                }, {});
        };

        const estadosBuca = getEstados(estBuca, coincidenciasBuca);
        const estadosBog = getEstados(estBog, coincidenciasBog);

        return {
            bucaramanga: {
                chatUsers: chatBuca.users.length,
                validPhones: telefonosChatBuca.size,
                registros: estBuca.length,
                conversiones: coincidenciasBuca.length,
                tasaConversion: (coincidenciasBuca.length / telefonosChatBuca.size) * 100,
                estados: estadosBuca
            },
            bogota: {
                chatUsers: chatBog.users.length,
                validPhones: telefonosChatBog.size,
                registros: estBog.length,
                conversiones: coincidenciasBog.length,
                tasaConversion: (coincidenciasBog.length / telefonosChatBog.size) * 100,
                estados: estadosBog
            },
            global: {
                totalChatUsers: chatBuca.users.length + chatBog.users.length,
                totalValidPhones: telefonosChatBuca.size + telefonosChatBog.size,
                totalConversiones: coincidenciasBuca.length + coincidenciasBog.length,
                totalRegistros: estBuca.length + estBog.length,
                tasaConversionGlobal: ((coincidenciasBuca.length + coincidenciasBog.length) / 
                    (telefonosChatBuca.size + telefonosChatBog.size)) * 100
            }
        };
    } catch (error) {
        console.error('Error en el procesamiento:', error);
        throw new Error(error instanceof Error ? error.message : 'Error al procesar los archivos Excel');
    }
};