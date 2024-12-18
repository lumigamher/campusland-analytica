'use client';

import React from 'react';
import type { CustomLabelProps, BarChartCustomLabelProps } from '../types';

export const CustomBarLabel: React.FC<BarChartCustomLabelProps> = ({ x, y, width, value }) => (
    <text
        x={x + width / 2}
        y={y - 10}
        fill="#666"
        textAnchor="middle"
        fontSize="12"
        dy={-6}
    >
        {`${value} (${((value / 100) * 100).toFixed(1)}%)`}
    </text>
);

export const CustomPieLabel: React.FC<CustomLabelProps> = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    value,
    name
}) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text 
            x={x} 
            y={y} 
            fill="black" 
            textAnchor={x > cx ? 'start' : 'end'} 
            dominantBaseline="central"
            className="text-base md:text-lg font-medium"
        >
            {`${name}: ${value} (${(percent * 100).toFixed(1)}%)`}
        </text>
    );
};