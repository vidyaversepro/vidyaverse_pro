import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { MagazineTab } from './MagazineTab';
import TestSeriesPage from './TestSeriesPage';
import { cn } from '@/lib/utils';

export default function VisionariumPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'magazine' | 'test-series' | 'resources' | 'courses'>('magazine');

    // Handle deep linking to test-series
    useEffect(() => {
        if (location.pathname.includes('/test-series')) {
            setActiveTab('test-series');
        } else if (location.pathname.endsWith('/visionarium')) {
            setActiveTab('magazine');
        }
    }, [location.pathname]);

    const handleTabChange = (tab: typeof activeTab) => {
        setActiveTab(tab);
        if (tab === 'test-series') {
            navigate('/student/visionarium/test-series', { replace: true });
        } else if (tab === 'magazine') {
            navigate('/student/visionarium', { replace: true });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-7 h-7 text-orange-500" />
                        Visionarium (विज़नेरियम)
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        India-rooted educational content, test series & student contributions
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-xl w-max border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                <button
                    onClick={() => handleTabChange('magazine')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                        activeTab === 'magazine'
                            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/5"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                    )}
                >
                    Magazine
                </button>
                <button
                    onClick={() => handleTabChange('test-series')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                        activeTab === 'test-series'
                            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/5"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                    )}
                >
                    Test Series
                </button>
                <button
                    onClick={() => handleTabChange('resources')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 opacity-50 cursor-not-allowed",
                        activeTab === 'resources'
                            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/5"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                    )}
                >
                    Resources (Soon)
                </button>
                <button
                    onClick={() => handleTabChange('courses')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 opacity-50 cursor-not-allowed",
                        activeTab === 'courses'
                            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/5"
                            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                    )}
                >
                    Courses (Soon)
                </button>
            </div>

            {/* Content */}
            <div className="pt-2">
                {activeTab === 'magazine' && <MagazineTab />}
                {activeTab === 'test-series' && <TestSeriesPage />}
                {activeTab === 'resources' && (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-lg font-medium">Coming Soon</p>
                    </div>
                )}
                {activeTab === 'courses' && (
                    <div className="text-center py-16 text-gray-400">
                        <p className="text-lg font-medium">Coming Soon</p>
                    </div>
                )}
            </div>
        </div>
    );
}
