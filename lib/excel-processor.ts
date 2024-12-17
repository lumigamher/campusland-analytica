import * as XLSX from 'xlsx';
import { AnalysisResult } from '../types';

interface ChatData {
    chat: any[];
    users: {
        'User ID': number;
        'Phone Number': string | number;
        Username: string;
    }[];
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
    const readExcelFile = async (file: File, isChat: boolean = false) => {
        try {
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, {
                cellDates: true,
                cellNF: true,
                cellText: true
            });

            if (isChat) {
                // Para archivos de chat, necesitamos ambas hojas
                if (workbook.SheetNames.length < 2) {
                    throw new Error('El archivo de chat debe contener dos hojas');
                }
                return {
                    chat: XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]),
                    users: XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[1]])
                } as ChatData;
            } else {
                // Para archivos de estudiantes, solo necesitamos la primera hoja
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
            readExcelFile(chatBucaFile, true),
            readExcelFile(chatBogFile, true),
            readExcelFile(estBucaFile, false),
            readExcelFile(estBogFile, false)
        ]);

        // Procesar teléfonos del chat
        const telefonosChatBuca = new Set(
            (chatBuca as ChatData).users
                .map(u => normalizarTelefono(u['Phone Number']))
                .filter((t): t is string => t !== null)
        );

        const telefonosChatBog = new Set(
            (chatBog as ChatData).users
                .map(u => normalizarTelefono(u['Phone Number']))
                .filter((t): t is string => t !== null)
        );

        // Procesar teléfonos de estudiantes
        const telefonosRegBuca = new Set(
            (estBuca as StudentData[])
                .map(e => normalizarTelefono(e.Celular))
                .filter((t): t is string => t !== null)
        );

        const telefonosRegBog = new Set(
            (estBog as StudentData[])
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

        const estadosBuca = getEstados(estBuca as StudentData[], coincidenciasBuca);
        const estadosBog = getEstados(estBog as StudentData[], coincidenciasBog);

        // Construir resultado
        return {
            bucaramanga: {
                chatUsers: (chatBuca as ChatData).users.length,
                validPhones: telefonosChatBuca.size,
                registros: (estBuca as StudentData[]).length,
                conversiones: coincidenciasBuca.length,
                tasaConversion: (coincidenciasBuca.length / telefonosChatBuca.size) * 100,
                estados: estadosBuca
            },
            bogota: {
                chatUsers: (chatBog as ChatData).users.length,
                validPhones: telefonosChatBog.size,
                registros: (estBog as StudentData[]).length,
                conversiones: coincidenciasBog.length,
                tasaConversion: (coincidenciasBog.length / telefonosChatBog.size) * 100,
                estados: estadosBog
            },
            global: {
                totalChatUsers: (chatBuca as ChatData).users.length + (chatBog as ChatData).users.length,
                totalValidPhones: telefonosChatBuca.size + telefonosChatBog.size,
                totalConversiones: coincidenciasBuca.length + coincidenciasBog.length,
                totalRegistros: (estBuca as StudentData[]).length + (estBog as StudentData[]).length,
                tasaConversionGlobal: ((coincidenciasBuca.length + coincidenciasBog.length) / 
                    (telefonosChatBuca.size + telefonosChatBog.size)) * 100
            }
        };
    } catch (error) {
        console.error('Error en el procesamiento:', error);
        throw new Error(error instanceof Error ? error.message : 'Error al procesar los archivos Excel');
    }
};