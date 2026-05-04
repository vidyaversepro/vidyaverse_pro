// =============================================================================
// Platform Analytics Hooks for Super Admin Dashboard
// =============================================================================
// Backend endpoint: GET /analytics/platform (super_admin only, no institution required)
//
// Response shape:
// {
//   success: boolean,
//   data: {
//     overview: { totalStudents: number; totalInstitutions: number; pendingApprovals: number; };
//     recentActivity: { type: string; description: string; timestamp: string; }[];
//     monthlyEnrollments: { month: string; count: number; }[];
//   }
// }
// =============================================================================

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// =============================================================================
// TYPES
// =============================================================================

export interface PlatformStatsData {
    overview: {
        totalStudents: number;
        totalInstitutions: number;
        pendingApprovals: number;
    };
    recentActivity: {
        type: string;
        description: string;
        timestamp: string;
    }[];
    monthlyEnrollments: {
        month: string;
        count: number;
    }[];
}

interface PlatformStatsResponse {
    success: boolean;
    data: PlatformStatsData;
}

// Keep these for backward compatibility with components that import them
export interface DashboardOverviewResponse {
    success: boolean;
    data: PlatformStatsData;
}

export interface StudentAnalyticsResponse {
    success: boolean;
    data: {
        monthlyEnrollments: { month: string; count: number }[];
    };
}

export interface DashboardStatsQueryInput {
    period?: 'today' | 'week' | 'month' | 'quarter' | 'year';
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook to fetch platform-wide dashboard stats (super_admin level).
 * Returns overview KPIs and recent activity.
 */
export function useDashboardStats(_params?: DashboardStatsQueryInput) {
    return useQuery({
        queryKey: ['dashboard', 'platform-stats'],
        queryFn: async () => {
            const response = await api.get<PlatformStatsResponse>('/analytics/platform');
            return response.data.data;
        },
        staleTime: 1000 * 60 * 2,
        refetchOnWindowFocus: false,
    });
}

/**
 * Hook to fetch student enrollment analytics.
 * Reuses the same /analytics/platform endpoint (which includes monthlyEnrollments).
 */
export function useStudentAnalytics() {
    return useQuery({
        queryKey: ['analytics', 'platform-students'],
        queryFn: async () => {
            const response = await api.get<PlatformStatsResponse>('/analytics/platform');
            return response.data.data;
        },
        staleTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
    });
}
