
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useInstitutions, useClasses, useStreams, useSections } from '@/lib/queries/institution/institution-queries';

interface Step1ContextSelectorProps {
    institutionId: string;
    setInstitutionId: (id: string) => void;
    classId: string;
    setClassId: (id: string) => void;
    streamId: string | null;
    setStreamId: (id: string | null) => void;
    sectionId: string;
    setSectionId: (id: string) => void;
    setSectionCapacity: (cap: number) => void;
    setSectionEnrolledCount: (count: number) => void;
    isInstitutionLocked: boolean;
    isClassLocked: boolean;
    isStreamLocked: boolean;
    isSectionLocked: boolean;
    onNext: () => void;
}

export function Step1ContextSelector({
    institutionId, setInstitutionId,
    classId, setClassId,
    streamId, setStreamId,
    sectionId, setSectionId,
    setSectionCapacity,
    setSectionEnrolledCount,
    isInstitutionLocked,
    isClassLocked,
    isStreamLocked,
    isSectionLocked,
    onNext
}: Step1ContextSelectorProps) {

    // 1. Fetch Institutions
    const { data: instData, isLoading: instLoading } = useInstitutions({});
    const institutions = instData?.data || [];

    // 2. Fetch Classes for selected institution
    const { data: classes, isLoading: classesLoading } = useClasses(institutionId);

    // Check if the currently selected class has streams enabled
    const selectedClassObj = classes?.find((c: any) => c.id === classId);
    const requiresStream = selectedClassObj?.streamsEnabled;

    // 3. Fetch Streams if conditionally required
    const { data: streams, isLoading: streamsLoading } = useStreams(classId, institutionId);

    // 4. Fetch Sections
    // Only fetch if class is selected, and if streams are required, stream must be selected too.
    const shouldFetchSections = !!classId && (!requiresStream || !!streamId);
    const { data: sections, isLoading: sectionsLoading } = useSections(classId, institutionId, streamId || undefined);

    const handleClassChange = (newClassId: string) => {
        setClassId(newClassId);
        setStreamId(null);
        setSectionId('');
    };

    const handleStreamChange = (newStreamId: string) => {
        setStreamId(newStreamId);
        setSectionId('');
    };

    const handleSectionChange = (newSectionId: string) => {
        setSectionId(newSectionId);
        const sectionObj = sections?.find((s: any) => s.id === newSectionId);
        if (sectionObj) {
            setSectionCapacity(sectionObj.expectedStudentCount || 0);
            // This assumes the API returns a _count.students relation - if not it defaults to 0 safely
            setSectionEnrolledCount(sectionObj._count?.students || 0);
        }
    };

    return (
        <Card className="shadow-none border">
            <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
                    Select Target Section
                </CardTitle>
                <CardDescription>Choose exactly where the imported students should be enrolled.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Institution */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Institution</label>
                        <Select
                            value={institutionId}
                            onValueChange={(val) => { setInstitutionId(val); setClassId(''); setStreamId(null); setSectionId(''); }}
                            disabled={isInstitutionLocked || instLoading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={instLoading ? "Loading..." : "Select Institution"} />
                            </SelectTrigger>
                            <SelectContent>
                                {institutions.map((inst: any) => (
                                    <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Class */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Class</label>
                        <Select
                            value={classId}
                            onValueChange={handleClassChange}
                            disabled={!institutionId || isSectionLocked || isClassLocked || classesLoading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={classesLoading ? "Loading..." : "Select Class"} />
                            </SelectTrigger>
                            <SelectContent>
                                {classes?.map((cls: any) => (
                                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Stream (Conditional) */}
                    {requiresStream && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Stream</label>
                            <Select
                                value={streamId || ''}
                                onValueChange={handleStreamChange}
                                disabled={!classId || isSectionLocked || isStreamLocked || streamsLoading}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={streamsLoading ? "Loading..." : "Select Stream"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {streams?.map((str: any) => (
                                        <SelectItem key={str.id} value={str.id}>{str.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Section</label>
                        <Select
                            value={sectionId}
                            onValueChange={handleSectionChange}
                            disabled={!shouldFetchSections || isSectionLocked || sectionsLoading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={sectionsLoading ? "Loading..." : "Select Section"} />
                            </SelectTrigger>
                            <SelectContent>
                                {sections?.map((sec: any) => {
                                    const enrolled = sec._count?.students || 0;
                                    const capacity = sec.expectedStudentCount || 0;
                                    return (
                                        <SelectItem key={sec.id} value={sec.id}>
                                            {sec.name} <span className="text-muted-foreground ml-2">({enrolled}/{capacity} filled)</span>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <Button onClick={onNext} disabled={!sectionId}>
                        Continue to Upload <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
