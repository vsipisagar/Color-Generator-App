import React from 'react';

const addAlpha = (hex: string, alphaHex = '33') => {
    if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) return hex;
    const hexVal = hex.startsWith('#') ? hex.slice(1) : hex;
    if (hexVal.length === 3) {
        return `#${hexVal.split('').map(c => c + c).join('')}${alphaHex}`;
    }
    if (hexVal.length === 6) {
        return `#${hexVal}${alphaHex}`;
    }
    return hex;
};

const StatCard = ({ icon, title, value, iconBgColor, iconColor }: { icon: string; title: string; value: string; iconBgColor: string; iconColor: string; }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm flex items-center justify-between">
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: iconBgColor }}>
            <i className={`${icon} text-2xl`} style={{ color: iconColor }}></i>
        </div>
    </div>
);

const DashboardVisualization = ({ colors }: { colors: string[] }) => {
    // Ensure we have a consistent 10-color palette to work with,
    // repeating the provided colors if necessary.
    const fullPalette = Array.from({ length: 10 }, (_, i) => {
        if (!colors || colors.length === 0) {
            // A default palette if nothing is provided
            const defaults = ['#4f46e5', '#10b981', '#f59e0b', '#facc15', '#ef4444', '#6366f1', '#22c55e', '#fb923c', '#eab308', '#be123c'];
            return defaults[i];
        }
        return colors[i % colors.length];
    });

    const primary = fullPalette[0];

    const genderColors = {
        male: fullPalette[0],
        female: fullPalette[1],
        third: fullPalette[2],
    };

    const barData = [
        { grade: 'Grade 9', male: 140, female: 145, third: 5, total: 290 },
        { grade: 'Grade 10', male: 130, female: 135, third: 5, total: 270 },
        { grade: 'Grade 11', male: 120, female: 125, third: 5, total: 250 },
        { grade: 'Grade 12', male: 105, female: 110, third: 5, total: 220 },
    ];
    const maxEnrollment = 300;
    
    const statusColors: { [key: string]: string } = {
        Completed: fullPalette[1],
        Pending: fullPalette[4],
        Resolved: fullPalette[5],
    };
    
    const donutGradient = `conic-gradient(${fullPalette[0]} 0% 60%, ${fullPalette[1]} 60% 85%, ${fullPalette[2]} 85% 100%)`;
    
    const scheduleItems = [
        { title: 'Parent-Teacher Conference', time: 'Oct 25, 9:00 AM - 4:00 PM', tag: 'General', color: fullPalette[6] },
        { title: 'High School Science Fair', time: 'Nov 3, 1:00 PM', tag: 'Academic', color: fullPalette[7] },
        { title: 'Annual Sports Day', time: 'Nov 15, All Day', tag: 'Extracurricular', color: fullPalette[8] },
    ];

    return (
        <div className="w-full h-full bg-gray-50 font-sans text-gray-900 flex p-4">
            {/* Sidebar */}
            <aside className="w-56 bg-white rounded-l-xl p-6 flex flex-col flex-shrink-0 shadow-lg">
                <h1 className="text-2xl font-bold" style={{ color: primary }}>
                    Academia <span className="text-gray-800">CMS</span>
                </h1>
                <nav className="mt-10 flex flex-col gap-2">
                    <a href="#" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-white font-semibold" style={{ backgroundColor: primary }}>
                        <i className="ri-home-4-line text-xl"></i>
                        <span>Dashboard</span>
                    </a>
                    {['Students', 'Grades', 'Events'].map(item => (
                        <a href="#" key={item} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-500 font-semibold hover:bg-gray-100">
                            <i className={`ri-${item === 'Students' ? 'group' : item === 'Grades' ? 'file-chart' : 'calendar-event'}-line text-xl`}></i>
                            <span>{item}</span>
                        </a>
                    ))}
                </nav>
                <div className="mt-auto text-xs text-gray-400">
                    Auth Error: Firebase Config Missing
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-gray-800">School Overview</h2>
                    <div className="flex items-center gap-4">
                        <i className="ri-notification-3-line text-2xl text-gray-500 cursor-pointer"></i>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: addAlpha(primary, 'B3') }}>
                            JD
                        </div>
                    </div>
                </header>

                <section className="grid grid-cols-4 gap-6 mt-8">
                    <StatCard title="Total Students" value="1,050" icon="ri-graduation-cap-line" iconColor={fullPalette[0]} iconBgColor={addAlpha(fullPalette[0], '4D')} />
                    <StatCard title="Total Staff" value="115" icon="ri-briefcase-4-line" iconColor={fullPalette[1]} iconBgColor={addAlpha(fullPalette[1], '4D')} />
                    <StatCard title="Daily Attendance" value="94.5%" icon="ri-check-line" iconColor={fullPalette[2]} iconBgColor={addAlpha(fullPalette[2], '4D')} />
                    <StatCard title="Upcoming Events" value="3" icon="ri-calendar-check-line" iconColor={fullPalette[3]} iconBgColor={addAlpha(fullPalette[3], '4D')} />
                </section>

                <section className="grid grid-cols-3 gap-6 mt-6">
                    <div className="col-span-2 flex flex-col gap-6">
                        {/* Student Enrollment by Grade */}
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-semibold">Student Enrollment by Grade</h3>
                                <div className="flex items-center gap-4 text-xs">
                                    {Object.entries(genderColors).map(([gender, color]) => (
                                        <div key={gender} className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded" style={{ backgroundColor: color }}></div>
                                            <span className="capitalize">{gender}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-4 flex" style={{ height: '250px' }}>
                                {/* Y-axis Labels */}
                                <div className="flex flex-col justify-between text-right pr-4 text-xs text-gray-400 w-10 flex-shrink-0">
                                    <span>300</span>
                                    <span>250</span>
                                    <span>200</span>
                                    <span>150</span>
                                    <span>100</span>
                                    <span>50</span>
                                    <span className="pb-4">0</span>
                                </div>
                                {/* Chart Area */}
                                <div className="w-full flex flex-col">
                                    <div className="relative flex-1 border-l border-gray-200">
                                        {/* Gridlines */}
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="absolute w-full border-t border-dashed border-gray-200" style={{ bottom: `${((i + 1) / 6) * 100}%` }}></div>
                                        ))}
                                        {/* Bars */}
                                        <div className="absolute bottom-0 w-full h-full flex justify-around items-end px-4">
                                            {barData.map(item => (
                                                <div key={item.grade} className="w-10/12 max-w-[4.5rem] h-full flex items-end justify-center group/bar relative">
                                                    <div
                                                        className="w-full flex flex-col-reverse rounded-t-lg overflow-hidden"
                                                        style={{
                                                            height: `${(item.total / maxEnrollment) * 100}%`,
                                                            transition: 'height 0.5s ease-in-out'
                                                        }}
                                                    >
                                                        <div className="transition-all duration-300" title={`Male: ${item.male}`} style={{ height: `${(item.male / item.total) * 100}%`, backgroundColor: genderColors.male }} />
                                                        <div className="transition-all duration-300" title={`Female: ${item.female}`} style={{ height: `${(item.female / item.total) * 100}%`, backgroundColor: genderColors.female }} />
                                                        <div className="transition-all duration-300" title={`Third Gender: ${item.third}`} style={{ height: `${(item.third / item.total) * 100}%`, backgroundColor: genderColors.third }} />
                                                    </div>
                                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md shadow-lg opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none">
                                                        Total: {item.total}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* X-axis Labels */}
                                    <div className="w-full flex justify-around border-t border-gray-200 pt-2">
                                        {barData.map(item => (
                                            <p key={item.grade} className="text-xs text-gray-500 text-center w-10/12 max-w-[4.5rem]">{item.grade}</p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activities */}
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h3 className="text-lg font-semibold mb-4">Recent Student Activities</h3>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-500 font-semibold">
                                        {['Student Name', 'Grade', 'Activity', 'Date', 'Status'].map(h => <th key={h} className="pb-3">{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { name: 'Alex Johnson', grade: '10th', activity: 'Math Test Score', date: 'Oct 20', status: 'Completed' },
                                        { name: 'Maria Sanchez', grade: '9th', activity: 'New Enrollment', date: 'Oct 19', status: 'Pending' },
                                        { name: 'David Lee', grade: '12th', activity: 'Library Book Return', date: 'Oct 18', status: 'Resolved' },
                                        { name: 'Sarah Chen', grade: '11th', activity: 'Field Trip Sign-up', date: 'Oct 17', status: 'Completed' },
                                    ].map(row => (
                                        <tr key={row.name} className="border-t border-gray-100">
                                            <td className="py-3 font-medium">{row.name}</td>
                                            <td>{row.grade}</td>
                                            <td>{row.activity}</td>
                                            <td>{row.date}</td>
                                            <td>
                                                <span className="px-2 py-1 rounded-full text-xs font-semibold"
                                                    style={{ 
                                                        backgroundColor: addAlpha(statusColors[row.status] || '#6b7280', '33'),
                                                        color: statusColors[row.status] || '#6b7280'
                                                    }}>
                                                    {row.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <a href="#" className="block text-sm font-semibold mt-4 text-center" style={{ color: primary }}>View All Activities →</a>
                        </div>
                    </div>

                    <div className="col-span-1 flex flex-col gap-6">
                        {/* Department Breakdown */}
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <h3 className="text-lg font-semibold mb-4">Staff Department Breakdown</h3>
                            <div className="flex justify-center items-center my-6">
                                <div className="w-40 h-40 rounded-full relative flex items-center justify-center"
                                    style={{ background: donutGradient }}>
                                    <div className="w-[70%] h-[70%] bg-white rounded-full"></div>
                                </div>
                            </div>
                            <ul className="space-y-2 text-sm">
                                {[{ name: 'Academic (60%)', color: fullPalette[0] }, { name: 'Administration (25%)', color: fullPalette[1] }, { name: 'Support (15%)', color: fullPalette[2] }].map(item => (
                                    <li key={item.name} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
                                        <span>{item.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* Upcoming Schedule */}
                        <div className="bg-white p-6 rounded-xl shadow-sm flex-1">
                            <h3 className="text-lg font-semibold mb-4">Upcoming Schedule</h3>
                            <div className="space-y-4">
                                {scheduleItems.map(item => (
                                    <div key={item.title} className="flex gap-3">
                                        <div className="w-1 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <div>
                                            <p className="font-semibold">{item.title}</p>
                                            <p className="text-xs text-gray-500">{item.time}</p>
                                            <span className="mt-1 inline-block px-2 py-0.5 rounded text-xs" style={{ backgroundColor: addAlpha(item.color, '4D'), color: item.color }}>{item.tag}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <h4 className="text-md font-semibold mt-6 mb-2">New Announcement</h4>
                            <textarea className="w-full h-20 p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-offset-1 focus:outline-none" style={{'--tw-ring-color': primary} as React.CSSProperties} placeholder="Write a quick announcement..."></textarea>
                            <button className="w-full py-2 mt-2 rounded-lg text-white font-semibold" style={{ backgroundColor: primary }}>Publish</button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default DashboardVisualization;