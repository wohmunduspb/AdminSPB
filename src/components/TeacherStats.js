'use strict';

import { Users, BarChart2 } from '/src/utils/icons.js';

const { useMemo } = React;

/**
 * A dashboard widget to display statistics about teachers.
 * @param {object} props - The component props.
 * @param {Array<object>} props.teachers - The list of all teacher objects.
 * @returns {React.ReactElement} The teacher statistics component.
 */
export function TeacherStats({ teachers = [] }) {

    const stats = useMemo(() => {
        const levelCounts = {
            sd: 0,
            smp: 0,
            sma: 0,
        };

        teachers.forEach(teacher => {
            const pendidikan = (teacher.pendidikan || '').toLowerCase();
            
            if (pendidikan.includes('sd')) levelCounts.sd++;
            if (pendidikan.includes('smp')) levelCounts.smp++;
            if (pendidikan.includes('sma')) levelCounts.sma++;
            if (pendidikan.includes('all')) {
                levelCounts.sd++;
                levelCounts.smp++;
                levelCounts.sma++;
            }
        });

        return [
            { label: 'SD', count: levelCounts.sd, color: 'bg-blue-500' },
            { label: 'SMP', count: levelCounts.smp, color: 'bg-green-500' },
            { label: 'SMA', count: levelCounts.sma, color: 'bg-purple-500' },
        ];
    }, [teachers]);

    const maxValue = Math.max(...stats.map(s => s.count), 1);

    return React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
        React.createElement('div', { className: 'flex items-center gap-3 mb-4' },
            React.createElement(BarChart2, { size: 20, className: 'text-gray-700' }),
            React.createElement('h3', { className: 'text-lg font-bold text-gray-800' }, 'Statistik Guru per Jenjang')
        ),
        React.createElement('div', { className: 'space-y-3' },
            stats.map(stat => {
                const barWidth = (stat.count / maxValue) * 100;
                return React.createElement('div', { key: stat.label, className: 'grid grid-cols-4 items-center gap-2 text-sm' },
                    React.createElement('div', { className: 'font-semibold text-gray-700' }, stat.label),
                    React.createElement('div', { className: 'col-span-3 flex items-center' },
                        React.createElement('div', { className: 'w-full bg-gray-200 rounded-full h-5' },
                            React.createElement('div', { className: `${stat.color} h-5 rounded-full transition-all duration-500`, style: { width: `${barWidth}%` } })
                        ),
                        React.createElement('span', { className: 'ml-3 font-bold text-gray-700' }, stat.count)
                    )
                );
            })
        )
    );
}