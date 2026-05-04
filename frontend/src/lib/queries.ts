// =============================================================================
// BACKWARD-COMPATIBILITY SHIM
// =============================================================================
// This file re-exports every hook and type from the new modular query structure
// at `@/lib/queries/index.ts`. Existing imports that reference `@/lib/queries`
// (without the directory) will continue to resolve here.
//
// For NEW code, prefer importing directly from the domain module:
//   import { useStudents } from '@/lib/queries/student/student-queries';
// =============================================================================

export * from './queries/index';
