'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from './ui/table';
import type { UserTableProps } from '../types';

export const UserTable: React.FC<UserTableProps> = ({ users, title, description }) => (
    <Card className="mt-8">
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            {description && <p className="text-sm text-gray-500">{description}</p>}
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Edad</TableHead>
                            <TableHead>Celular</TableHead>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Ciudad</TableHead>
                            <TableHead>Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user, index) => (
                            <TableRow key={index}>
                                <TableCell>{user.nombre}</TableCell>
                                <TableCell>{user.edad || 'N/A'}</TableCell>
                                <TableCell>{user.celular}</TableCell>
                                <TableCell>{new Date(user.fecha).toLocaleString('es-CO')}</TableCell>
                                <TableCell>{user.ciudad}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs 
                                        ${user.registrado 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        {user.estado || (user.registrado ? 'Registrado' : 'Solo Chat')}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
);