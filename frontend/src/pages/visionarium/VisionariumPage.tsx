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
                    <h1 className="arch-section-header text-2xl flex items-center gap-2">
                        <BookOpen className="w-7 h-7 text-primary" />
                        Visionarium (विज़नेरियम)
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        India-rooted educational content, test series & student contributions
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-1 bg-muted/50 p-1 rounded-xl w-full sm:w-max border border-border/50 backdrop-blur-sm">
                <button
                    onClick={() => handleTabChange('magazine')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                        activeTab === 'magazine'
                            ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                >
                    Magazine
                </button>
                <button
                    onClick={() => handleTabChange('test-series')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                        activeTab === 'test-series'
                            ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                >
                    Test Series
                </button>
                <button
                    onClick={() => handleTabChange('resources')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 opacity-50 cursor-not-allowed",
                        activeTab === 'resources'
                            ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                >
                    Resources (Soon)
                </button>
                <button
                    onClick={() => handleTabChange('courses')}
                    className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 opacity-50 cursor-not-allowed",
                        activeTab === 'courses'
                            ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
                    <div className="text-center py-16 text-muted-foreground">
                        <p className="text-lg font-medium">Coming Soon</p>
                    </div>
                )}
                {activeTab === 'courses' && (
                    <div className="text-center py-16 text-muted-foreground">
                        <p className="text-lg font-medium">Coming Soon</p>
                    </div>
                )}
            </div>
        </div>
    );
}
