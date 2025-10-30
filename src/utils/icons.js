'use strict';

// Icon components (React functional components returning SVG)
export const Printer = ({ size = 24, className = "" }) => (    
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('polyline', { points: '6 9 6 2 18 2 18 9' }),
    React.createElement('path', { d: 'M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2' }),
    React.createElement('rect', { x: '6', y: '14', width: '12', height: '8' })
  )
);

export const FileText = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
    React.createElement('polyline', { points: '14 2 14 8 20 8' }),
    React.createElement('line', { x1: '16', y1: '13', x2: '8', y2: '13' }),
    React.createElement('line', { x1: '16', y1: '17', x2: '8', y2: '17' })
  )
);

export const Users = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
    React.createElement('circle', { cx: '9', cy: '7', r: '4' }),
    React.createElement('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
    React.createElement('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })
  )
);

export const Calendar = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('rect', { x: '3', y: '4', width: '18', height: '18', rx: '2', ry: '2' }),
    React.createElement('line', { x1: '16', y1: '2', x2: '16', y2: '6' }),
    React.createElement('line', { x1: '8', y1: '2', x2: '8', y2: '6' }),
    React.createElement('line', { x1: '3', y1: '10', x2: '21', y2: '10' })
  )
);

export const Download = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
    React.createElement('polyline', { points: '7 10 12 15 17 10' }),
    React.createElement('line', { x1: '12', y1: '15', x2: '12', y2: '3' })
  )
);

export const Save = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('path', { d: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z' }),
    React.createElement('polyline', { points: '17 21 17 13 7 13 7 21' }),
    React.createElement('polyline', { points: '7 3 7 8 15 8' })
  )
);

export const Search = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('circle', { cx: '11', cy: '11', r: '8' }),
    React.createElement('path', { d: 'm21 21-4.35-4.35' })
  )
);

export const Plus = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('line', { x1: '12', y1: '5', x2: '12', y2: '19' }),
    React.createElement('line', { x1: '5', y1: '12', x2: '19', y2: '12' })
  )
);

export const RefreshCw = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('polyline', { points: '23 4 23 10 17 10' }),
    React.createElement('polyline', { points: '1 20 1 14 7 14' }),
    React.createElement('path', { d: 'M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15' })
  )
);

export const Cloud = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('path', { d: 'M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z' })
  )
);

export const CheckCircle = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
    React.createElement('polyline', { points: '22 4 12 14.01 9 11.01' })
  )
);

export const Mail = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('path', { d: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' }),
    React.createElement('polyline', { points: '22,6 12,13 2,6' })
  )
);

export const TrendingUp = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('polyline', { points: '23 6 13.5 15.5 8.5 10.5 1 18' }),
    React.createElement('polyline', { points: '17 6 23 6 23 12' })
  )
);

export const ChevronDown = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('polyline', { points: '6 9 12 15 18 9' })
  )
);

export const ChevronUp = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('polyline', { points: '18 15 12 9 6 15' })
  )
);

export const Settings = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('circle', { cx: '12', cy: '12', r: '3' }),
    React.createElement('path', { d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z' })
  )
);

export const ChevronLeft = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('polyline', { points: '15 18 9 12 15 6' })
  )
);

export const ChevronRight = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('polyline', { points: '9 18 15 12 9 6' })
  )
);

export const Menu = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('line', { x1: '3', y1: '12', x2: '21', y2: '12' }),
    React.createElement('line', { x1: '3', y1: '6', x2: '21', y2: '6' }),
    React.createElement('line', { x1: '3', y1: '18', x2: '21', y2: '18' })
  )
);

export const Clipboard = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('path', { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' }),
    React.createElement('rect', { x: '8', y: '2', width: '8', height: '4', rx: '1', ry: '1' })
  )
);

export const Trash2 = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('polyline', { points: '3 6 5 6 21 6' }),
    React.createElement('path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' }),
    React.createElement('line', { x1: '10', y1: '11', x2: '10', y2: '17' }),
    React.createElement('line', { x1: '14', y1: '11', x2: '14', y2: '17' })
  )
);

export const AlertTriangle = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('path', { d: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' }),
    React.createElement('line', { x1: '12', y1: '9', x2: '12', y2: '13' }),
    React.createElement('line', { x1: '12', y1: '17', x2: '12.01', y2: '17' })
  )
);


export const FileWarning = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('path', { d: 'M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z' }),
    React.createElement('path', { d: 'M12 9v4' }),
    React.createElement('path', { d: 'M12 17h.01' })
  )
);

export const Eye = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('path', { d: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' }),
    React.createElement('circle', { cx: '12', cy: '12', r: '3' })
  )
);

export const EyeOff = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('path', { d: 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' }),
    React.createElement('line', { x1: '1', y1: '1', x2: '23', y2: '23' })
  )
);

export const User = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('path', { d: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' }),
    React.createElement('circle', { cx: '12', cy: '7', r: '4' })
  )
);

export const UserPlus = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('path', { d: 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
    React.createElement('circle', { cx: '9', cy: '7', r: '4' }),
    React.createElement('line', { x1: '23', y1: '11', x2: '17', y2: '11' }),
    React.createElement('line', { x1: '20', y1: '8', x2: '20', y2: '14' })
  )
);

export const LogOut = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('path', { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }),
    React.createElement('polyline', { points: '16 17 21 12 16 7' }),
    React.createElement('line', { x1: '21', y1: '12', x2: '9', y2: '12' })
  )
);

export const Lock = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('rect', { x: '3', y: '11', width: '18', height: '11', rx: '2', ry: '2' }),
    React.createElement('path', { d: 'M7 11V7a5 5 0 0 1 10 0v4' })
  )
);

export const DollarSign = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('line', { x1: '12', y1: '1', x2: '12', y2: '23' }),
    React.createElement('path', { d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' })
  )
);

export const Box = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('path', { d: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' }),
    React.createElement('polyline', { points: '3.27 6.96 12 12.01 20.73 6.96' }),
    React.createElement('line', { x1: '12', y1: '22.08', x2: '12', y2: '12' })
  )
);

export const Archive = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('polyline', { points: '21 8 21 21 3 21 3 8' }),
    React.createElement('rect', { x: '1', y: '3', width: '22', height: '5' }),
    React.createElement('line', { x1: '10', y1: '12', x2: '14', y2: '12' })
  )
);

export const BookOpen = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('path', { d: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z' }),
    React.createElement('path', { d: 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' })
  )
);

export const Edit = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
    React.createElement('path', { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' })
  )
);

export const Server = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('rect', { x: '2', y: '2', width: '20', height: '8', rx: '2', ry: '2' }),
    React.createElement('rect', { x: '2', y: '14', width: '20', height: '8', rx: '2', ry: '2' }),
    React.createElement('line', { x1: '6', y1: '6', x2: '6.01', y2: '6' }),
    React.createElement('line', { x1: '6', y1: '18', x2: '6.01', y2: '18' })
  )
);

export const Code = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('polyline', { points: '16 18 22 12 16 6' }),
    React.createElement('polyline', { points: '8 6 2 12 8 18' })
  )
);

export const Filter = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('polygon', { points: '22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3' })
  )
);

export const XCircle = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
    React.createElement('line', { x1: '15', y1: '9', x2: '9', y2: '15' }),
    React.createElement('line', { x1: '9', y1: '9', x2: '15', y2: '15' })
  )
);

export const BarChart2 = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('line', { x1: '18', y1: '20', x2: '18', y2: '10' }),
    React.createElement('line', { x1: '12', y1: '20', x2: '12', y2: '4' }),
    React.createElement('line', { x1: '6', y1: '20', x2: '6', y2: '14' })
  )
);

export const PlusCircle = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
    React.createElement('line', { x1: '12', y1: '8', x2: '12', y2: '16' }),
    React.createElement('line', { x1: '8', y1: '12', x2: '16', y2: '12' })
  )
);

export const Database = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('ellipse', { cx: '12', cy: '5', rx: '9', ry: '3' }),
    React.createElement('path', { d: 'M21 12c0 1.66-4 3-9 3s-9-1.34-9-3' }),
    React.createElement('path', { d: 'M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5' })
  )
);

export const GraduationCap = ({ size = 24, className = "" }) => (
  React.createElement('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', className },
    React.createElement('path', { d: 'M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.084a1 1 0 0 0 0 1.838l8.57 3.908a2 2 0 0 0 1.66 0z' }),
    React.createElement('path', { d: 'M22 10v6' }),
    React.createElement('path', { d: 'M6 12.5V16a6 3 0 0 0 12 0v-3.5' })
  )
);
