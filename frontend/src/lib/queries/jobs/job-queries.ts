import { useQuery } from '@tanstack/react-query';
import { api } from '../../api.js';
import type { JobQueryInput } from '@vidyaverse/shared-validation';

export interface JobExecution {
    id: string;
    jobId: string;
    jobType: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    progress: number;
    totalItems: number;
    processedItems: number;
    successfulItems: number;
    failedItems: number;
    errorMessage?: string;
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    durationSeconds?: number;
}

interface JobsResponse {
    success: boolean;
    data: JobExecution[];
    pagination: {
        total: number;
        pages: number;
        page: number;
        limit: number;
    };
}

export function useJobs(query: JobQueryInput) {
    return useQuery({
        queryKey: ['jobs', query],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (query.status) params.append('status', query.status);
            if (query.jobType) params.append('jobType', query.jobType);
            params.append('page', String(query.page || 1));
            params.append('limit', String(query.limit || 20));

            const { data } = await api.get<JobsResponse>(`/jobs?${params.toString()}`);
            return data;
        },
        refetchInterval: () => {
            // Poll every 3 seconds if status filter is processing or queued
            if (query.status === 'processing' || query.status === 'queued') return 3000;
            return false;
        }
    });
}
