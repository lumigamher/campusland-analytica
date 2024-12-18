import { type ClassValue, clsx } from "clsx";
import * as XLSX from 'xlsx';
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function formatNumber(num: number): string {
    return new Intl.NumberFormat('es-CO').format(num);
}

export function formatPercentage(num: number): string {
    return `${num.toFixed(1)}%`;
}

export function getDateRange(days: number): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    return { start, end };
}

export function groupByDate<T extends { fecha: string }>(
    items: T[],
    keyExtractor: (item: T) => string = item => item.fecha
): Record<string, T[]> {
    return items.reduce((acc, item) => {
        const key = keyExtractor(item);
        if (!acc[key]) {
            acc[key] = [];
        }
        acc[key].push(item);
        return acc;
    }, {} as Record<string, T[]>);
}

export const downloadExcel = (data: any[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
};