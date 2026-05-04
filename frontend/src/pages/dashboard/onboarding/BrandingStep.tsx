import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useOnboardingStore } from '@/stores/onboarding.store';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BrandingStep() {
    const { logoFile, darkLogoFile, setLogoFile, setDarkLogoFile, institutionType } = useOnboardingStore();

    const onDropLogo = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles[0]) setLogoFile(acceptedFiles[0]);
    }, [setLogoFile]);

    const onDropDarkLogo = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles[0]) setDarkLogoFile(acceptedFiles[0]);
    }, [setDarkLogoFile]);

    const { getRootProps: getLogoProps, getInputProps: getLogoInput, isDragActive: isLogoActive } = useDropzone({
        onDrop: onDropLogo,
        accept: { 'image/png': ['.png'], 'image/svg+xml': ['.svg'] },
        maxSize: 5242880, // 5MB
        multiple: false
    });

    const { getRootProps: getDarkProps, getInputProps: getDarkInput, isDragActive: isDarkActive } = useDropzone({
        onDrop: onDropDarkLogo,
        accept: { 'image/png': ['.png'], 'image/svg+xml': ['.svg'] },
        maxSize: 5242880, // 5MB
        multiple: false
    });

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold">Branding & Identity</h3>
                <p className="text-sm text-muted-foreground">
                    Upload official logos for your {institutionType.toLowerCase().replace('_', ' ')}.
                    We accept PNG and SVG formats up to 5MB.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                {/* Primary Logo Upload */}
                <div className="space-y-3">
                    <label className="text-sm font-medium">Primary Logo (Light Theme)</label>
                    {logoFile ? (
                        <div className="border border-input rounded-xl p-4 flex flex-col items-center justify-center bg-muted/30 relative group">
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => setLogoFile(null)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                            <img src={URL.createObjectURL(logoFile)} alt="Logo Preview" className="max-h-32 object-contain" />
                            <p className="text-xs text-muted-foreground mt-4 truncate max-w-[200px]">{logoFile.name}</p>
                        </div>
                    ) : (
                        <div {...getLogoProps()} className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${isLogoActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'}`}>
                            <input {...getLogoInput()} />
                            <UploadCloud className="w-8 h-8 text-muted-foreground mb-4" />
                            <p className="text-sm font-medium text-center">Drag & drop your primary logo here</p>
                            <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                            <p className="text-xs text-muted-foreground mt-4">PNG or SVG, max 5MB</p>
                        </div>
                    )}
                </div>

                {/* Dark Logo Upload */}
                <div className="space-y-3">
                    <label className="text-sm font-medium">Dark Theme Logo (Optional)</label>
                    {darkLogoFile ? (
                        <div className="border border-input rounded-xl p-4 flex flex-col items-center justify-center bg-slate-900 relative group">
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => setDarkLogoFile(null)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                            <img src={URL.createObjectURL(darkLogoFile)} alt="Dark Logo Preview" className="max-h-32 object-contain" />
                            <p className="text-xs text-slate-400 mt-4 truncate max-w-[200px]">{darkLogoFile.name}</p>
                        </div>
                    ) : (
                        <div {...getDarkProps()} className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDarkActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'}`}>
                            <input {...getDarkInput()} />
                            <ImageIcon className="w-8 h-8 text-muted-foreground mb-4" />
                            <p className="text-sm font-medium text-center">Drag & drop dark theme variant</p>
                            <p className="text-xs text-muted-foreground mt-1">If empty, primary logo is used</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
