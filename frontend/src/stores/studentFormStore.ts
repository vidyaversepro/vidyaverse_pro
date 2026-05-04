import { create } from 'zustand';

export type FormTab = 'academic' | 'personal' | 'photo' | 'family' | 'contact' | 'other';

interface StudentFormState {
    activeTab: FormTab;
    tabAcademic: boolean;
    tabPersonal: boolean;
    tabPhoto: boolean;
    tabFamily: boolean;
    tabContact: boolean;
    tabOther: boolean;

    // Basic Data
    studentId: string | null;
    institutionId: string | null;

    // Draft data per tab (preserves unsaved changes when switching tabs)
    drafts: Partial<Record<FormTab, Record<string, any>>>;

    // Actions
    setActiveTab: (tab: FormTab) => void;
    setTabComplete: (tab: FormTab, isComplete: boolean) => void;
    saveDraft: (tab: FormTab, data: Record<string, any>) => void;
    getDraft: (tab: FormTab) => Record<string, any> | undefined;
    clearDraft: (tab: FormTab) => void;
    initializeProgress: (data: {
        activeTab?: FormTab;
        tabAcademic?: boolean;
        tabPersonal?: boolean;
        tabPhoto?: boolean;
        tabFamily?: boolean;
        tabContact?: boolean;
        tabOther?: boolean;
        studentId?: string;
        institutionId?: string;
    }) => void;
    resetProgress: () => void;
}

const initialState = {
    activeTab: 'personal' as FormTab,
    tabAcademic: false,
    tabPersonal: false,
    tabPhoto: false,
    tabFamily: false,
    tabContact: false,
    tabOther: false,
    studentId: null,
    institutionId: null,
    drafts: {} as Partial<Record<FormTab, Record<string, any>>>,
};

export const useStudentFormStore = create<StudentFormState>((set, get) => ({
    ...initialState,

    setActiveTab: (tab) => set({ activeTab: tab }),

    setTabComplete: (tab, isComplete) => set((state) => {
        switch (tab) {
            case 'academic': return { ...state, tabAcademic: isComplete };
            case 'personal': return { ...state, tabPersonal: isComplete };
            case 'photo': return { ...state, tabPhoto: isComplete };
            case 'family': return { ...state, tabFamily: isComplete };
            case 'contact': return { ...state, tabContact: isComplete };
            case 'other': return { ...state, tabOther: isComplete };
            default: return state;
        }
    }),

    saveDraft: (tab, data) => set((state) => ({
        drafts: { ...state.drafts, [tab]: data },
    })),

    getDraft: (tab) => get().drafts[tab],

    clearDraft: (tab) => set((state) => {
        const { [tab]: _, ...rest } = state.drafts;
        return { drafts: rest };
    }),

    initializeProgress: (data) => set((state) => ({ ...state, ...data })),

    resetProgress: () => set(initialState),
}));
