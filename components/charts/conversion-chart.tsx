
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ConversionChartProps } from '../../types';
import { Card, CardContent } from '../ui/card';

const ConversionChart = ({ data }: ConversionChartProps) => {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Conversión por Ciudad</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ciudad" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="usuarios" name="Total Usuarios" fill="#93c5fd" />
                <Bar dataKey="telefonos" name="Con Teléfono" fill="#60a5fa" />
                <Bar dataKey="conversiones" name="Conversiones" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  export default ConversionChart;