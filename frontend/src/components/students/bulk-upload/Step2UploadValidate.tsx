import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, Download, CheckCircle2, AlertTriangle, XCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import type { ParsedCsvRow } from './useBulkUploadWizard';

interface Step2UploadValidateProps {
    file: File | null;
    isParsing: boolean;
    validRowsCount: number;
    errorRowsCount: number;
    warningRowsCount: number;
    willOverflow: boolean;
    availableSlots: number;
    parsedRows: ParsedCsvRow[];
    onFileUpload: (file: File) => void;
    onBack: () => void;
    onNext: () => void;
}

export function Step2UploadValidate({
    file,
    isParsing,
    validRowsCount,
    errorRowsCount,
    warningRowsCount,
    willOverflow,
    availableSlots,
    parsedRows,
    onFileUpload,
    onBack,
    onNext
}: Step2UploadValidateProps) {

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDownloadTemplate = () => {
        const headers = [
            'rollNo', 'name', 'admissionNumber', 'academicYear', 'fatherName', 'motherName',
            'guardianName', 'guardianRelation', 'guardianPhone', 'sex', 'dob', 'bloodGroup',
            'aadharNumber', 'caste', 'religion', 'contact', 'parentEmail', 'address',
            'city', 'state', 'pincode', 'dateOfAdmission', 'previousSchool', 'transportMode'
        ];

        const csvContent = headers.join(',') + '\n' +
            `101,John Doe,ADM2025-001,2025-2026,Richard Doe,Jane Doe,,,,Male,2010-05-15,O+,,,,9876543210,parent@example.com,123 Main St,Metropolis,State,123456,2025-04-01,,School Bus`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'student_bulk_upload_template.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            onFileUpload(selectedFile);
        }
    };

    return (
        <Card className="shadow-none border">
            <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
                        Upload & Validate
                    </CardTitle>
                    <CardDescription>Upload your CSV and review client-side validations.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                    <Download className="w-4 h-4 mr-2" />
                    Download CSV Template
                </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">

                {/* File Drop Zone */}
                {!file && (
                    <div
                        className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-12 flex flex-col items-center justify-center bg-muted/10 transition-colors hover:bg-muted/20 cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".csv"
                            className="hidden"
                        />
                        <div className="p-4 bg-primary/10 rounded-full mb-4 text-primary">
                            <UploadCloud className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">Click or drag CSV file to upload</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-md">
                            Only standard .csv files are supported. Please ensure you've used the exact template headers.
                        </p>
                    </div>
                )}

                {/* Parsing State */}
                {isParsing && (
                    <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                        <p>Parsing and validating rows...</p>
                    </div>
                )}

                {/* File Loaded & Validated State */}
                {file && !isParsing && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border">
                            <div className="flex items-center">
                                <FileText className="w-6 h-6 text-primary mr-3" />
                                <div>
                                    <p className="font-medium">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB • {parsedRows.length} rows</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
                                Change File
                            </Button>
                        </div>

                        {/* Validation Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-lg p-4 flex flex-col items-center text-center">
                                <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-2" />
                                <span className="font-bold text-2xl text-emerald-700 dark:text-emerald-400">{validRowsCount}</span>
                                <span className="text-sm text-emerald-600 font-medium">Valid (Ready)</span>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4 flex flex-col items-center text-center">
                                <AlertTriangle className="w-6 h-6 text-amber-600 mb-2" />
                                <span className="font-bold text-2xl text-amber-700 dark:text-amber-400">{warningRowsCount}</span>
                                <span className="text-sm text-amber-600 font-medium">Warnings (Will Import)</span>
                            </div>
                            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-lg p-4 flex flex-col items-center text-center">
                                <XCircle className="w-6 h-6 text-rose-600 mb-2" />
                                <span className="font-bold text-2xl text-rose-700 dark:text-rose-400">{errorRowsCount}</span>
                                <span className="text-sm text-rose-600 font-medium">Errors (Rejected)</span>
                            </div>
                        </div>

                        {willOverflow && (
                            <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded text-sm text-rose-800 dark:bg-rose-950/50 dark:text-rose-200">
                                <strong>Warning: Section Capacity Exceeded.</strong>
                                {' '}You are attempting to import {validRowsCount} students, but only {availableSlots} slots remain in the selected section. The extra rows will be rejected by the server.
                            </div>
                        )}

                        {/* Error preview snippet */}
                        {errorRowsCount > 0 && (
                            <div className="border rounded-md overflow-hidden text-sm">
                                <div className="bg-rose-100 dark:bg-rose-900/30 px-3 py-2 font-medium text-rose-800 dark:text-rose-300">
                                    Top Validation Errors
                                </div>
                                <div className="divide-y max-h-48 overflow-y-auto">
                                    {parsedRows.filter(r => r.state === 'error').slice(0, 10).map((errRow, idx) => (
                                        <div key={idx} className="p-3 bg-white dark:bg-background flex gap-4">
                                            <span className="text-muted-foreground font-mono w-16">Row {errRow.originalIndex}</span>
                                            <div className="flex flex-col">
                                                {errRow.errors.map((e, i) => <span key={i} className="text-destructive font-medium">{e}</span>)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-between pt-4 border-t">
                    <Button variant="outline" onClick={onBack}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button
                        onClick={onNext}
                        disabled={!file || validRowsCount === 0 || isParsing || willOverflow}
                    >
                        Preview & Summary <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
