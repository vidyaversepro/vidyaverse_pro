import { useFormContext } from 'react-hook-form';
import { PhotoCaptureEditor } from '../photo/PhotoCaptureEditor';

interface OtherTabProps {
    studentId: string;
    mode: 'volunteer' | 'selfservice' | 'admin' | 'view';
}

export function OtherTab(props: OtherTabProps) {
    const { setValue, watch } = useFormContext();
    const currentPhotoUrl = watch('photoUrl');

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Review & Photo Capture</h3>
                <p className="text-sm text-gray-500">Capture the ID card photo and finalize the application.</p>
            </div>

            <PhotoCaptureEditor
                mode={props.mode}
                currentPhotoUrl={currentPhotoUrl}
                onSave={(_file, previewUrl) => {
                    setValue('photoUrl', previewUrl, { shouldDirty: true, shouldValidate: true });
                }}
            />
        </div>
    );
}
