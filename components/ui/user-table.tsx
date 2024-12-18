import { Table } from 'lucide-react';
import React from 'react';
import { TableCaption, TableHeader, TableRow, TableHead, TableBody, TableCell } from './table';
import { UserData } from '../../types';


interface UserTableProps {
  users: UserData[];
  title: string;
  description?: string;
}

export const UserTable: React.FC<UserTableProps> = ({ users, title, description }) => {
  return (
    <Table>
      {description && <TableCaption>{description}</TableCaption>}
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Nombre</TableHead>
          <TableHead>Edad</TableHead>
          <TableHead>Celular</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Ciudad</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={`${user.userId}-${user.celular}`}>
            <TableCell className="font-medium">{user.nombre}</TableCell>
            <TableCell>{user.edad || 'N/A'}</TableCell>
            <TableCell>{user.celular}</TableCell>
            <TableCell>{new Date(user.fecha).toLocaleString('es-CO')}</TableCell>
            <TableCell>{user.ciudad}</TableCell>
            <TableCell>
              <span 
                className={`px-2 py-1 rounded-full text-xs font-semibold
                  ${user.registrado 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                  }`}
              >
                {user.registrado ? 'Registrado' : 'Solo Chat'}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};