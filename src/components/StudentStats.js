'use strict';

import { Users, Filter, XCircle, BarChart2, ChevronDown, ChevronUp } from '/src/utils/icons.js';

const { useState, useMemo } = React;

/**
 * A dashboard widget to display customizable statistics about students.
 * @param {object} props - The component props.
 * @param {Array<object>} props.students - The list of all student objects.
 * @returns {React.ReactElement} The student statistics component.
 */
export function StudentStats({ students }) {
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        selectedClasses: new Set(),
        gradeLevel: '',
        jk: '',
        agama: '',
        status: ''
    });

    // useMemo to avoid re-calculating dropdown options on every render
    const uniqueOptions = useMemo(() => {
        const klasses = new Set();
        const genders = new Set();
        const religions = new Set();
        const statuses = new Set();
        const uniqueGradeLevels = new Set();
        const gradeLevelCounts = {}; // For parallel stats: { '1': 50, '2': 48 }


        (students || []).forEach(student => {
            if (student.kelas) klasses.add(student.kelas);
            if (student.jk) genders.add(student.jk);
            if (student.agama) religions.add(student.agama);
            if (student.status) statuses.add(student.status);
            if (student.kelas) {
                const gradeMatch = student.kelas.match(/^\d+/);
                if (gradeMatch) uniqueGradeLevels.add(gradeMatch[0]);
            }
        });
        
        // Calculate stats per grade level
        (students || []).forEach(student => {
            if (student.kelas) {
                const gradeMatch = student.kelas.match(/^\d+/); // e.g., "7A" -> "7"
                if (gradeMatch) {
                    const grade = gradeMatch[0];
                    gradeLevelCounts[grade] = (gradeLevelCounts[grade] || 0) + 1;
                }
            }
        });

        return {
            kelas: [...klasses].sort(),
            jk: [...genders].sort(),
            agama: [...religions].sort(),
            status: [...statuses].sort(),
            gradeLevels: [...uniqueGradeLevels].sort((a, b) => parseInt(a) - parseInt(b)),
            gradeLevelCounts: Object.entries(gradeLevelCounts).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
        };
    }, [students]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        if (name === 'gradeLevel') {
            const newSelectedClasses = new Set();
            if (value) { // If a grade level is selected
                students.forEach(student => {
                    if (student.kelas && student.kelas.startsWith(value)) {
                        newSelectedClasses.add(student.kelas);
                    }
                });
            }
            setFilters(prev => ({ ...prev, gradeLevel: value, selectedClasses: newSelectedClasses }));
        } else {
            setFilters(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleClassCheckboxChange = (className) => {
        setFilters(prev => {
            const newSelectedClasses = new Set(prev.selectedClasses);
            if (newSelectedClasses.has(className)) {
                newSelectedClasses.delete(className);
            } else {
                newSelectedClasses.add(className);
            }
            // If manual checkbox changes, reset the gradeLevel dropdown
            return { ...prev, selectedClasses: newSelectedClasses, gradeLevel: '' };
        });
    };

    const resetFilters = () => {
        setFilters({ selectedClasses: new Set(), gradeLevel: '', jk: '', agama: '', status: '' });
    };

    const filteredStudents = (students || []).filter(student => {
        return (
            (filters.selectedClasses.size > 0 ? filters.selectedClasses.has(student.kelas) : true) &&
            (filters.jk ? student.jk === filters.jk : true) &&
            (filters.agama ? student.agama === filters.agama : true) &&
            (filters.status ? student.status === filters.status : true)
        );
    });

    // useMemo for chart data to prevent re-calculation on every render
    const genderDistribution = useMemo(() => {
        const distribution = filteredStudents.reduce((acc, student) => {
            const gender = student.jk || 'Tidak Diketahui';
            acc[gender] = (acc[gender] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(distribution);
    }, [filteredStudents]);

    const gradeLevelDistribution = useMemo(() => {
        return uniqueOptions.gradeLevelCounts;
    }, [uniqueOptions.gradeLevelCounts]);

    const hasActiveFilters = filters.selectedClasses.size > 0 || filters.gradeLevel || filters.jk || filters.agama || filters.status;

    const renderSelect = (name, label, options) => (
        React.createElement('div', null,
            React.createElement('label', { htmlFor: `filter-${name}`, className: 'block text-sm font-medium text-gray-700' }, label),
            React.createElement('select', { id: `filter-${name}`, name, value: filters[name], onChange: handleFilterChange, className: 'mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md' },
                React.createElement('option', { value: '' }, `Semua ${label}`),
                options.map(opt => React.createElement('option', { key: opt, value: opt }, opt))
            )
        )
    );

    const PieChart = ({ data, colors }) => {
        const total = data.reduce((sum, [, value]) => sum + value, 0);
        if (total === 0) return React.createElement('div', { className: 'text-center text-gray-500' }, 'Tidak ada data');

        let cumulativePercent = 0;
        const segments = data.map(([label, value], index) => {
            const percent = (value / total) * 100;
            const startAngle = (cumulativePercent / 100) * 360;
            cumulativePercent += percent;
            const endAngle = (cumulativePercent / 100) * 360;
            return { label, value, percent, color: colors[index % colors.length], startAngle, endAngle };
        });

        return React.createElement('div', { className: 'flex flex-col md:flex-row items-center gap-6' },
            React.createElement('div', { className: 'relative w-32 h-32 rounded-full', style: { background: `conic-gradient(${segments.map(s => `${s.color} ${s.startAngle}deg ${s.endAngle}deg`).join(', ')})` } }),
            React.createElement('div', { className: 'flex flex-col gap-2' },
                segments.map(s => React.createElement('div', { key: s.label, className: 'flex items-center gap-2 text-sm' },
                    React.createElement('div', { className: 'w-3 h-3 rounded-sm', style: { backgroundColor: s.color } }),
                    React.createElement('span', { className: 'font-semibold' }, s.label),
                    React.createElement('span', { className: 'text-gray-600' }, `(${s.value} siswa - ${s.percent.toFixed(1)}%)`)
                ))
            )
        );
    };

    return React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
        React.createElement('div', { className: 'flex items-center gap-3 mb-6' },
            React.createElement(Users, { size: 24, className: 'text-indigo-600' }),
            React.createElement('h3', { className: 'text-2xl font-bold text-gray-800' }, 'Statistik Siswa')
        ),

        React.createElement('div', { className: 'mb-8' },
            React.createElement('h4', { className: 'text-lg font-semibold text-gray-700 mb-3' }, 'Jumlah Siswa per Tingkat'),
            React.createElement('div', { className: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4' },
                gradeLevelDistribution.map(([grade, count]) => React.createElement('div', { key: grade, className: 'bg-slate-100 p-4 rounded-lg text-center' },
                    React.createElement('div', { className: 'text-3xl font-bold text-slate-800' }, count),
                    React.createElement('div', { className: 'text-sm font-semibold text-slate-600' }, `Kelas ${grade}`)
                ))
            )
        ),

        React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8' },
            React.createElement('div', null,
                React.createElement('h4', { className: 'text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2' }, React.createElement(BarChart2, { size: 18 }), 'Distribusi Tingkat'),
                React.createElement('div', { className: 'space-y-3' },
                    (() => {
                        const maxValue = Math.max(...gradeLevelDistribution.map(([, count]) => count));
                        return gradeLevelDistribution.map(([grade, count]) => {
                            const barWidth = maxValue > 0 ? (count / maxValue) * 100 : 0;
                            return React.createElement('div', { key: grade, className: 'grid grid-cols-4 items-center gap-2 text-sm' },
                                React.createElement('div', { className: 'font-semibold text-gray-700' }, `Kelas ${grade}`),
                                React.createElement('div', { className: 'col-span-3 flex items-center' },
                                    React.createElement('div', { className: 'w-full bg-gray-200 rounded-full h-5' },
                                        React.createElement('div', { className: 'bg-indigo-500 h-5 rounded-full transition-all duration-500', style: { width: `${barWidth}%` } })
                                    ),
                                    React.createElement('span', { className: 'ml-3 font-bold text-indigo-700' }, count)
                                )
                            );
                        });
                    })()
                )
            ),
            React.createElement('div', null,
                React.createElement('h4', { className: 'text-lg font-semibold text-gray-700 mb-3' }, 'Distribusi Jenis Kelamin'),
                React.createElement(PieChart, { data: genderDistribution, colors: ['#4f46e5', '#818cf8', '#c7d2fe'] })
            )
        ),

        React.createElement('div', { className: 'border-t pt-6 mt-8' },
            React.createElement('button', { onClick: () => setShowFilters(!showFilters), className: 'w-full flex justify-between items-center mb-4' },
                React.createElement(Filter, { size: 20, className: 'text-gray-600' }),
                React.createElement('h4', { className: 'text-lg font-semibold text-gray-700' }, 'Filter Detail Siswa'),
                showFilters ? React.createElement(ChevronUp, { size: 20 }) : React.createElement(ChevronDown, { size: 20 })
            ),
            showFilters && React.createElement('div', { className: 'animate-fade-in-down' },
                React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-4 mb-4' },
                    renderSelect('gradeLevel', 'Tingkat', uniqueOptions.gradeLevels),
                    renderSelect('jk', 'Jenis Kelamin', uniqueOptions.jk),
                    renderSelect('agama', 'Agama', uniqueOptions.agama),
                    renderSelect('status', 'Status', uniqueOptions.status)
                ),
                React.createElement('div', { className: 'mb-4' },
                    React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Kelas Spesifik'),
                    React.createElement('div', { className: 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 p-3 border rounded-lg bg-gray-50 max-h-40 overflow-y-auto' },
                        uniqueOptions.kelas.map(opt => React.createElement('label', { key: opt, className: 'flex items-center gap-2 p-1.5 rounded-md cursor-pointer hover:bg-indigo-100' },
                            React.createElement('input', { type: 'checkbox', checked: filters.selectedClasses.has(opt), onChange: () => handleClassCheckboxChange(opt), className: 'h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500' }),
                            React.createElement('span', { className: 'text-sm font-medium text-gray-800' }, opt)
                        ))
                    )
                ),
                React.createElement('div', { className: 'mt-6 flex flex-col md:flex-row items-center justify-between bg-indigo-50 p-4 rounded-lg' },
                    React.createElement('div', { className: 'flex items-center gap-3' },
                        React.createElement(Users, { size: 32, className: 'text-indigo-500' }),
                        React.createElement('span', { className: 'text-2xl font-bold text-indigo-800' }, `${filteredStudents.length} Siswa`),
                        React.createElement('span', { className: 'text-gray-600' }, hasActiveFilters ? 'ditemukan' : 'total')
                    ),
                    hasActiveFilters && React.createElement('button', { onClick: resetFilters, className: 'mt-3 md:mt-0 flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-800' }, React.createElement(XCircle, { size: 16 }), 'Reset Filter')
                )
            )
        )
    );
}