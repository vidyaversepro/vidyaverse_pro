import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormTab, useStudentFormStore } from '@/stores/studentFormStore';
import { schemaByTab } from '@vidyaverse/shared-validation';
import { AcademicTab } from './tabs/AcademicTab';
import { PersonalTab } from './tabs/PersonalTab';
import { PhotoTab } from './tabs/PhotoTab';
import { FamilyTab } from './tabs/FamilyTab';
import { ContactTab } from './tabs/ContactTab';
import { OtherTab } from './tabs/OtherTab';
import { CheckCircle2, CircleDashed, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export interface StudentTabFormProps {
    studentId?: string;
    institutionId: string;
    // mode defines if this is the public self-service token link, or an admin/teacher, or read-only view
    mode: 'volunteer' | 'selfservice' | 'admin' | 'view';
    onClose?: () => void;
    token?: string; // provided if mode === 'selfservice'
    contextInfo?: {
        className: string;
        sectionName: string;
        streamName?: string;
        rollNo?: number;
        admissionNumber?: string;
    };
}

const TABS: { id: FormTab; label: string }[] = [
    { id: 'personal', label: 'Personal' },
    { id: 'photo', label: 'Photograph' },
    { id: 'family', label: 'Family' },
    { id: 'contact', label: 'Contact' },
    { id: 'academic', label: 'Academic' },
    { id: 'other', label: 'Other Details' },
];

export function StudentTabForm({ studentId, institutionId, mode, onClose, token, contextInfo }: StudentTabFormProps) {
    const { activeTab, setActiveTab, setTabComplete, initializeProgress, saveDraft, getDraft, clearDraft } = useStudentFormStore();
    const queryClient = useQueryClient();
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const prevTabRef = useRef<FormTab>(activeTab);

    // In a real implementation we would fetch the student data and populate default values.
    // We also need to fetch the existing form progress.
    const { data: studentData, isLoading } = useQuery({
        queryKey: ['student-draft', studentId, token],
        queryFn: async () => {
            if (mode === 'selfservice' && token) {
                const res = await api.get(`/onboard/${token}`);
                return res.data;
            } else if (studentId) {
                const res = await api.get(`/student/${studentId}`);
                const student = res.data.data;
                // Mock form progress for now if it doesn't exist on standard student object
                if (!student.formProgress) {
                    student.formProgress = {
                        tabAcademic: true, // assume true if student exists for basic flow
                        tabPersonal: false,
                        tabPhoto: false,
                        tabFamily: false,
                        tabContact: false,
                        tabOther: false,
                        activeTab: 'personal',
                    };
                }
                return student;
            }
            return null;
        },
        enabled: !!studentId || (mode === 'selfservice' && !!token),
    });

    const { data: institution } = useQuery({
        queryKey: ['institution', institutionId],
        queryFn: async () => {
            const res = await api.get(`/institutions/${institutionId}`);
            return res.data.data;
        },
        enabled: !!institutionId
    });

    useEffect(() => {
        if (studentData?.formProgress) {
            initializeProgress({
                activeTab: studentData.formProgress.activeTab || 'personal',
                tabAcademic: studentData.formProgress.tabAcademic,
                tabPersonal: studentData.formProgress.tabPersonal,
                tabPhoto: studentData.formProgress.tabPhoto,
                tabFamily: studentData.formProgress.tabFamily,
                tabContact: studentData.formProgress.tabContact,
                tabOther: studentData.formProgress.tabOther,
                studentId: studentData.id,
                institutionId,
            });
        }
    }, [studentData, initializeProgress, institutionId]);

    // ─── Helper: normalize date values to YYYY-MM-DD for <input type="date"> ───
    const normalizeDate = useCallback((val: string | Date | null | undefined): string => {
        if (!val) return '';
        try {
            const d = new Date(val);
            return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
        } catch {
            return '';
        }
    }, []);

    // ─── Helper: extract tab-specific values from student data ───
    const getTabValues = useCallback((tab: FormTab, data: any) => {
        if (!data) return {};
        const base: Record<string, any> = {};
        const fields: Record<FormTab, string[]> = {
            personal: ['name', 'sex', 'dob', 'bloodGroup', 'aadharNumber'],
            photo: ['photoUrl'],
            family: ['fatherName', 'motherName', 'guardianName', 'guardianRelation', 'consentGiven', 'consentGivenBy'],
            contact: ['contact', 'parentEmail', 'address', 'city', 'state', 'pincode'],
            academic: ['institutionId', 'sectionId', 'rollNo', 'admissionNumber', 'dateOfAdmission', 'status', 'previousSchool', 'transportMode'],
            other: ['customData', 'photoUrl'],
        };
        for (const f of fields[tab] || []) {
            if (data[f] !== undefined) {
                // Normalize date fields at the boundary
                if (f === 'dob' || f === 'dateOfAdmission') {
                    base[f] = normalizeDate(data[f]);
                } else {
                    base[f] = data[f];
                }
            }
        }
        // Always inject institutionId for academic tab
        if (tab === 'academic') base.institutionId = institutionId;
        return base;
    }, [institutionId, normalizeDate]);

    // ─── Active Form Setup ───
    const formSchema = schemaByTab[activeTab];
    const methods = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {},
        mode: 'onTouched',
    });

    // ─── Reset form when tab or student data changes ───
    useEffect(() => {
        // Save current form draft before switching (if we actually switched tabs)
        if (prevTabRef.current !== activeTab) {
            const currentValues = methods.getValues();
            if (Object.keys(currentValues).length > 0) {
                saveDraft(prevTabRef.current, currentValues);
            }
            prevTabRef.current = activeTab;
        }

        // Determine values: draft first, then student data
        const draft = getDraft(activeTab);
        const serverValues = getTabValues(activeTab, studentData);
        const resetValues = draft ? { ...serverValues, ...draft } : serverValues;

        methods.reset(resetValues);
    }, [activeTab, studentData, methods, saveDraft, getDraft, getTabValues]);

    const isTabLocked = (tabId: FormTab) => {
        if (mode === 'view') return false; // Unlock all tabs in view mode

        const state = useStudentFormStore.getState();
        const currentIndex = TABS.findIndex(t => t.id === tabId);
        if (currentIndex === 0) return false;

        // A tab is locked if the previous tab is not complete
        const prevTabId = TABS[currentIndex - 1].id;
        const completeFlags: Record<FormTab, boolean> = {
            academic: state.tabAcademic,
            personal: state.tabPersonal,
            photo: state.tabPhoto,
            family: state.tabFamily,
            contact: state.tabContact,
            other: state.tabOther,
        };
        return !completeFlags[prevTabId];
    };

    const isTabComplete = (tabId: FormTab) => {
        const state = useStudentFormStore.getState();
        const completeFlags: Record<FormTab, boolean> = {
            academic: state.tabAcademic,
            personal: state.tabPersonal,
            photo: state.tabPhoto,
            family: state.tabFamily,
            contact: state.tabContact,
            other: state.tabOther,
        };
        return completeFlags[tabId];
    };

    const saveTabMutation = useMutation({
        mutationFn: async (data: any) => {
            if (mode === 'selfservice' && token) {
                return api.patch(`/onboard/${token}/save-tab`, { tab: activeTab, data });
            } else if (studentId) {
                return api.patch(`/student/${studentId}/save-tab`, { tab: activeTab, data }); // Custom endpoint for tab saves
            } else {
                return api.post(`/student`, data); // Initial creation if no ID yet (rare in draft flow)
            }
        },
        retry: false,
        onSuccess: async () => {
            toast.success(`${TABS.find(t => t.id === activeTab)?.label} details saved.`);
            setTabComplete(activeTab, true);
            clearDraft(activeTab); // Clear draft on successful save

            // Invalidate queries and wait for them to finish before progressing
            await queryClient.invalidateQueries({ queryKey: ['student-draft', studentId] });

            // Automatically move to next tab
            const currentIndex = TABS.findIndex(t => t.id === activeTab);
            if (currentIndex < TABS.length - 1) {
                setActiveTab(TABS[currentIndex + 1].id);
                // The useEffect watching activeTab will handle resetting
            } else {
                toast.success('All tabs completed!');
                if (onClose) onClose();
            }
        },
        onError: (error: any) => {
            const serverErrors = error?.response?.data?.errors;
            if (serverErrors && Array.isArray(serverErrors)) {
                serverErrors.forEach((err: any) => {
                    const path = err.path ? err.path.join('.') : 'root';
                    methods.setError(path as never, { type: 'server', message: err.message });
                });
                toast.error('Validation failed. Please check the highlighted fields.');
            } else {
                toast.error(error?.response?.data?.message || `Failed to save ${activeTab} details`);
            }
        }
    });

    const onSubmit = (data: any) => {
        if (saveTabMutation.isPending) return;
        // Cancel any pending auto-save
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
            autoSaveTimerRef.current = null;
        }
        saveTabMutation.mutate(data);
    };

    // ─── Auto-save: 5s debounce when form is dirty ───
    const watchedValues = methods.watch();
    useEffect(() => {
        if (mode === 'view' || !studentId || !methods.formState.isDirty) return;

        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        autoSaveTimerRef.current = setTimeout(() => {
            if (methods.formState.isDirty && !saveTabMutation.isPending) {
                setIsAutoSaving(true);
                const data = methods.getValues();
                saveTabMutation.mutate(data, {
                    onSettled: () => setIsAutoSaving(false),
                });
            }
        }, 5000);

        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchedValues]);

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading student draft...</div>;
    }

    // Dynamic Progress Border Calculation
    const fieldsToTrack = [
        'name', 'sex', 'dob', 'bloodGroup', 'aadharNumber',
        'fatherName', 'motherName', 'guardianName', 'consentGivenBy',
        'contact', 'parentEmail', 'address', 'city', 'state', 'pincode',
        'dateOfAdmission', 'previousSchool', 'transportMode', 'photoUrl'
    ];

    const currentValues = methods.watch() as Record<string, any>;

    // Count filled fields from actual data (from DB or form inputs)
    const filledFieldsCount = fieldsToTrack.reduce((count, field) => {
        const val = currentValues[field] ?? (studentData as any)?.[field];
        if (val !== undefined && val !== null && val !== '') {
            return count + 1;
        }
        return count;
    }, 0);

    const completionPercentage = Math.round((filledFieldsCount / fieldsToTrack.length) * 100);

    // Calculate generic RGB values to interpolate from Red (0%) to Green (100%)
    // Starting closer to a distinct red and moving to an emerald green
    const red = Math.max(0, 255 - (completionPercentage * 2.55));
    const green = Math.min(200, (completionPercentage * 2.0));
    const progressBorderColor = `rgb(${red}, ${green}, 50)`;

    return (
        <div
            className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden w-full max-w-4xl mx-auto rounded-lg shadow-sm border-[3px] transition-colors duration-500"
            style={{ borderColor: progressBorderColor }}
        >
            {/* Locked Institutional Context Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-800 p-4 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <div className="bg-white dark:bg-gray-800 border-2 border-primary/20 rounded-xl px-4 py-2 text-center shadow-sm">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Roll No</p>
                        <p className="text-xl font-black text-primary font-mono leading-none">
                            {contextInfo?.rollNo || studentData?.admissionSlot?.rollNo || '--'}
                        </p>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            {studentData?.name ? studentData.name : <span className="text-gray-400 italic">Empty Form Slot</span>}
                        </h2>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {institution?.name && (
                                <span className="flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300 mr-2">
                                    {institution.name}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                Class {contextInfo?.className || studentData?.section?.class?.name || '...'}
                            </span>
                            {(contextInfo?.streamName || studentData?.section?.stream?.name) && (
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                    {contextInfo?.streamName || studentData?.section?.stream?.name}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Section {contextInfo?.sectionName || studentData?.section?.name || '...'}
                            </span>
                        </div>
                    </div>
                </div>
                {mode === 'admin' && (
                    <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/30">
                        <Lock className="w-3.5 h-3.5" />
                        Parameters Locked
                    </div>
                )}
            </div>

            {/* Stepper Header */}
            <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4 shrink-0 overflow-x-auto">
                <div className="flex items-center min-w-max mx-auto space-x-2 sm:space-x-4">
                    {TABS.map((tab, idx) => {
                        const active = activeTab === tab.id;
                        const complete = isTabComplete(tab.id);
                        const locked = isTabLocked(tab.id);

                        return (
                            <React.Fragment key={tab.id}>
                                <button
                                    onClick={() => !locked && setActiveTab(tab.id)}
                                    disabled={locked}
                                    className={cn(
                                        "flex items-center space-x-2 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                                        active ? "bg-primary/10 text-primary" :
                                            locked ? "text-gray-400 cursor-not-allowed opacity-60" :
                                                "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                                    )}
                                    aria-disabled={locked}
                                    role="tab"
                                    aria-selected={active}
                                >
                                    {complete ? (
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    ) : locked ? (
                                        <Lock className="w-4 h-4 text-gray-400" />
                                    ) : (
                                        <CircleDashed className={cn("w-4 h-4", active ? "text-primary animate-pulse w-4 h-4" : "text-gray-400")} />
                                    )}
                                    <span className="whitespace-nowrap">{tab.label}</span>
                                </button>
                                {idx < TABS.length - 1 && (
                                    <div className="h-px w-4 sm:w-8 bg-gray-300 dark:bg-gray-700" />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <FormProvider {...methods}>
                    <form key={activeTab} id={`form-${activeTab}`} onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
                        <fieldset disabled={mode === 'view'} className="contents">
                            {activeTab === 'academic' && <AcademicTab disabled={mode === 'selfservice' || mode === 'view'} />}
                            {activeTab === 'personal' && <PersonalTab />}
                            {activeTab === 'photo' && <PhotoTab studentId={studentId || ''} mode={mode} />}
                            {activeTab === 'family' && <FamilyTab />}
                            {activeTab === 'contact' && <ContactTab />}
                            {activeTab === 'other' && <OtherTab studentId={studentId || ''} mode={mode} />}
                        </fieldset>
                    </form>
                </FormProvider>

                {/* Audit Panel (Admin only) */}
                {mode === 'admin' && studentData?.createdAt && (
                    <div className="mt-12 pt-6 border-t border-gray-100 dark:border-gray-800">
                        <details className="group">
                            <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <span>Audit & Metadata Information</span>
                                <span className="transition group-open:rotate-180">
                                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                </span>
                            </summary>
                            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 rounded-md p-4 space-y-2 font-mono">
                                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                                    <span>Record Created</span>
                                    <span>{new Date(studentData.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                                    <span>Last Modified</span>
                                    <span>{new Date(studentData.updatedAt).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-1">
                                    <span>Data Status</span>
                                    <span className="uppercase text-primary font-bold">{studentData.dataStatus}</span>
                                </div>
                                <div className="flex justify-between pb-1">
                                    <span>Student ID</span>
                                    <span>{studentData.id}</span>
                                </div>
                            </div>
                        </details>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-between shrink-0">
                {onClose ? (
                    <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium">
                        Close
                    </button>
                ) : <div />}

                {/* Auto-save indicator */}
                {isAutoSaving && (
                    <span className="text-xs text-gray-400 flex items-center gap-1.5 animate-pulse">
                        <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Auto-saving...
                    </span>
                )}

                {mode === 'view' ? (
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={() => {
                                const currentIndex = TABS.findIndex(t => t.id === activeTab);
                                if (currentIndex > 0) setActiveTab(TABS[currentIndex - 1].id);
                            }}
                            disabled={TABS.findIndex(t => t.id === activeTab) === 0}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            ← Previous
                        </button>
                        <button
                            onClick={() => {
                                const currentIndex = TABS.findIndex(t => t.id === activeTab);
                                if (currentIndex < TABS.length - 1) setActiveTab(TABS[currentIndex + 1].id);
                            }}
                            disabled={TABS.findIndex(t => t.id === activeTab) === TABS.length - 1}
                            className="px-5 py-2 bg-primary text-white rounded-md font-medium shadow-sm hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                        >
                            Next →
                        </button>
                    </div>
                ) : (
                    <button
                        type="submit"
                        form={`form-${activeTab}`}
                        disabled={saveTabMutation.isPending}
                        className="px-6 py-2 bg-primary text-white rounded-md font-medium shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {saveTabMutation.isPending ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Saving...
                            </>
                        ) : (
                            activeTab === 'other' ? 'Finish & Submit' : 'Save & Continue'
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
