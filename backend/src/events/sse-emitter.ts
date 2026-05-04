import { EventEmitter } from 'events';

class JobEventsEmitter extends EventEmitter {}

export const jobEvents = new JobEventsEmitter();
jobEvents.setMaxListeners(200);

/**
 * Emits progress data for a specific job.
 * @param jobId The BullMQ job ID
 * @param data The progress data or completion state
 */
export function emitJobProgress(jobId: string, data: any): void {
    jobEvents.emit(`job:${jobId}`, data);
}
