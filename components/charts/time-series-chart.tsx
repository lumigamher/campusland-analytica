'use client';

import React from 'react';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { DailyStats } from '../../types';
import { Card, CardContent } from '../ui/card';

interface Props {
  data: DailyStats[];
  title: string;
}

const TimeSeriesChart: React.FC<Props> = ({ data, title }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="fecha"
                tickFormatter={(value) => {
                  try {
                    return new Date(value).toLocaleDateString();
                  } catch {
                    return value;
                  }
                }}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                labelFormatter={(value) => {
                  try {
                    return new Date(value).toLocaleDateString();
                  } catch {
                    return value;
                  }
                }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="usuariosUnicos"
                name="Usuarios Únicos"
                stroke="#2563eb"
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="totalInteracciones"
                name="Total Interacciones"
                stroke="#93c5fd"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="tasaConversion"
                name="Tasa de Conversión (%)"
                stroke="#22c55e"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeSeriesChart;