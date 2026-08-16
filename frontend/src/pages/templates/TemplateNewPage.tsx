import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ChevronRight, ChevronLeft, ArrowLeft, Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

import { useCreateTemplate } from '@/lib/queries/templates/template-queries';
import { extractApiErrorMessage } from '@/lib/extractApiErrorMessage';
import {
  DesignUnit,
  DOCUMENT_PRESETS,
  ServiceType,
  presetForServiceType,
  toPx,
  fromPx,
  formatUnit,
  MIN_CANVAS_PX,
  MAX_CANVAS_PX,
} from '@/lib/units';
import { cn } from '@/lib/utils';

// --- Validation Schemas ---

const Step1Schema = z.object({
  name: z.string().trim().min(3, 'Name must be at least 3 characters').max(100),
  serviceType: z.string().min(1, 'Please select a product type'),
  targetAudience: z.string().min(1, 'Please select a target audience'),
  description: z.string().max(500).optional(),
});

const Step2Schema = z.object({
  widthPx: z.number().min(MIN_CANVAS_PX).max(MAX_CANVAS_PX),
  heightPx: z.number().min(MIN_CANVAS_PX).max(MAX_CANVAS_PX),
  unit: z.enum(['px', 'mm', 'cm', 'in']),
  orientation: z.enum(['portrait', 'landscape']),
});

const Step3Schema = z.object({
  pageCount: z.number().int().min(1).max(20),
  hasBackSide: z.boolean(),
  bleedMm: z.number().min(0).max(10),
  dpi: z.union([z.literal(72), z.literal(300), z.literal(600)]),
  colorMode: z.enum(['rgb', 'cmyk']),
});

const TemplateCreationSchema = Step1Schema.merge(Step2Schema).merge(Step3Schema);
type TemplateCreationForm = z.infer<typeof TemplateCreationSchema>;

type Step = 1 | 2 | 3;

export default function TemplateNewPage() {
  const navigate = useNavigate();
  const createTemplate = useCreateTemplate(); // Renamed from createMutation

  const [step, setStep] = useState<Step>(1);
  const [lastStepChange, setLastStepChange] = useState(0);

  // Initialize form
  const form = useForm<TemplateCreationForm>({
    resolver: zodResolver(TemplateCreationSchema),
    defaultValues: {
      name: '',
      serviceType: '',
      targetAudience: '',
      description: '',
      widthPx: toPx(210, 'mm'),
      heightPx: toPx(297, 'mm'),
      unit: 'mm',
      orientation: 'portrait',
      pageCount: 1,
      hasBackSide: false,
      bleedMm: 0,
      dpi: 300,
      colorMode: 'rgb',
    },
    mode: 'onChange',
  });

  const { watch, setValue, trigger, handleSubmit } = form;

  // Watchers for reactive UI
  const currentServiceType = watch('serviceType');
  const widthPx = watch('widthPx');
  const heightPx = watch('heightPx');
  const unit = watch('unit') as DesignUnit;
  const orientation = watch('orientation');
  const pages = watch('pageCount');

  // --- Handlers ---

  const handleNext = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await trigger(['name', 'serviceType', 'targetAudience', 'description']);
      // Auto-preset on moving to step 2 based on selected serviceType
      if (isValid && currentServiceType) {
        const presetKey = presetForServiceType(currentServiceType as ServiceType);
        const preset = DOCUMENT_PRESETS[presetKey];
        if (preset) {
            setValue('unit', preset.unit);
            setValue('widthPx', toPx(preset.widthMm, 'mm'));
            setValue('heightPx', toPx(preset.heightMm, 'mm'));
            setValue('orientation', preset.widthMm > preset.heightMm ? 'landscape' : 'portrait');
        }
      }
    } else if (step === 2) {
      isValid = await trigger(['widthPx', 'heightPx', 'unit', 'orientation']);
    }
    if (isValid && step < 3) {
        setLastStepChange(Date.now());
        setStep((step + 1) as Step);
    }
  };

  const handleBack = () => {
    setStep((s) => Math.max(1, s - 1) as Step);
  };

  const onOpenChange = (open: boolean) => {
    if (!open) navigate('/app/templates');
  };

  const onSubmit = async (data: TemplateCreationForm) => {
    if (step < 3) {
      handleNext();
      return;
    }

    // Prevent double-click bleed-through or key-repeat bugs
    if (Date.now() - lastStepChange < 400) {
        return;
    }

    const payload = {
        name: data.name,
        serviceType: data.serviceType,
        targetAudience: data.targetAudience,
        description: data.description,
        widthMm: fromPx(data.widthPx, 'mm'), // backend expects mm
        heightMm: fromPx(data.heightPx, 'mm'),
        orientation: data.orientation,
        templateType: 'json', // Default to JSON for the editor blocks
        content: {
            elements: [],
            canvasConfig: {
                widthMm: fromPx(data.widthPx, 'mm'),
                heightMm: fromPx(data.heightPx, 'mm'),
                scale: 1,
                bgColor: '#ffffff'
            },
            printConfig: {
                pageCount: data.pageCount,
                hasBackSide: data.hasBackSide,
                bleedMm: data.bleedMm,
                dpi: data.dpi,
                colorMode: data.colorMode
            }
        }
    };

    try {
        const newTemplate = await createTemplate.mutateAsync(payload);
        // Navigate to studio with the new template's ID
        navigate(`/app/templates/${newTemplate.id}/edit`);
        toast.success('Template created successfully!');
    } catch (error) {
        // Extract meaningful message from API error response
        const message = extractApiErrorMessage(error);
        // Show toast — use existing toast utility
        toast.error(message ?? 'Failed to create template. Please try again.');
        // Do NOT navigate away — keep user on the form
    }
  };

  // Unit conversion helpers for display
  const displayWidth = formatUnit(fromPx(widthPx, unit), unit);
  const displayHeight = formatUnit(fromPx(heightPx, unit), unit);

  const handleWidthChange = (valStr: string) => {
    const parsed = parseFloat(valStr);
    if (!isNaN(parsed)) {
      setValue('widthPx', toPx(parsed, unit), { shouldValidate: true });
    }
  };

  const handleHeightChange = (valStr: string) => {
    const parsed = parseFloat(valStr);
    if (!isNaN(parsed)) {
      setValue('heightPx', toPx(parsed, unit), { shouldValidate: true });
    }
  };

  const handleUnitChange = (newUnit: DesignUnit) => {
    setValue('unit', newUnit);
    // Doesn't change actual pixel dimensions, only display unit
  };

  const handlePresetSelect = (presetKey: string) => {
    const preset = DOCUMENT_PRESETS[presetKey];
    if (preset && preset.widthMm > 0) {
      setValue('unit', preset.unit);
      setValue('widthPx', toPx(preset.widthMm, 'mm'));
      setValue('heightPx', toPx(preset.heightMm, 'mm'));
      setValue('orientation', preset.widthMm > preset.heightMm ? 'landscape' : 'portrait');
    }
  };

  const toggleOrientation = () => {
    setValue('orientation', orientation === 'portrait' ? 'landscape' : 'portrait');
    // Swap dimensions
    const w = widthPx;
    setValue('widthPx', heightPx);
    setValue('heightPx', w);
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <div className="absolute top-4 left-4">
        <Button variant="ghost" onClick={() => navigate('/app/templates')} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Templates
        </Button>
      </div>

      <Dialog open={true} onOpenChange={onOpenChange}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-[600px] p-0 overflow-y-auto max-h-[90vh] border-0 shadow-2xl rounded-2xl">
          <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6">
            <DialogHeader>
              <DialogTitle className="text-2xl tracking-tight text-primary-foreground m-0">Create New Template</DialogTitle>
              <DialogDescription className="text-primary-foreground/80 mt-1 font-medium">
                Step {step} of 3 — {step === 1 ? 'Template Details' : step === 2 ? 'Canvas Size' : 'Pages & Print'}
              </DialogDescription>
            </DialogHeader>
            {/* Progress Bar */}
            <div className="flex gap-2 mt-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className={cn("h-1.5 flex-1 rounded-full", step >= i ? "bg-primary-foreground" : "bg-primary-foreground/30")} />
                ))}
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
                  e.preventDefault();
                  if (step < 3) handleNext();
                }
              }}
              className="p-6 bg-card space-y-6"
            >

              {/* --- STEP 1: Details --- */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Name <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Student ID Card 2026" className="rounded-xl bg-muted/40 border-border" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="serviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Type <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl bg-muted/40 border-border">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="visiting_card">🪪 Visiting Card</SelectItem>
                              <SelectItem value="id_card">🆔 ID Card</SelectItem>
                              <SelectItem value="certificate">🏆 Certificate</SelectItem>
                              <SelectItem value="hall_ticket">📋 Hall Ticket</SelectItem>
                              <SelectItem value="marksheet">📊 Marksheet</SelectItem>
                              <SelectItem value="library_card">📚 Library Card</SelectItem>
                              <SelectItem value="transfer_certificate">📁 Transfer Certificate</SelectItem>
                              <SelectItem value="portfolio">🌐 Portfolio Page</SelectItem>
                              <SelectItem value="group_photo">📸 Group Photo Overlay</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="targetAudience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Audience <span className="text-destructive">*</span></FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl bg-muted/40 border-border">
                                <SelectValue placeholder="Select audience" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ALL">👥 All (Students/Staff)</SelectItem>
                              <SelectItem value="STUDENT">🎓 Students Only</SelectItem>
                              <SelectItem value="TEACHER">👩‍🏫 Teachers & Staff Only</SelectItem>
                              <SelectItem value="ADMIN">🏛️ Admin Users Only</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Brief details about this template's usage..." className="rounded-xl bg-muted/40 border-border resize-none h-20" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* --- STEP 2: Dimensions --- */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <FormLabel className="mb-2 block">Preset Sizes</FormLabel>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.entries(DOCUMENT_PRESETS).filter(([key]) => key !== 'Custom').slice(0, 4).map(([key, p]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handlePresetSelect(key)}
                          className={cn(
                            "flex flex-col items-center justify-center p-2 rounded-xl border text-xs text-center transition-colors",
                            Math.abs(widthPx - toPx(p.widthMm, 'mm')) < 1 && Math.abs(heightPx - toPx(p.heightMm, 'mm')) < 1
                              ? "bg-primary/10 border-primary text-primary font-bold"
                              : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                          )}
                        >
                          <span className="truncate w-full">{key.split(' ')[0]}</span>
                          <span className="text-[9px] opacity-70 mt-1">{p.widthMm}×{p.heightMm}mm</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/40 rounded-xl border border-border">
                    <FormField
                      control={form.control}
                      name="widthPx"
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground">Width</FormLabel>
                          <FormControl>
                            <Input
                                type="number"
                                value={displayWidth}
                                onChange={(e) => handleWidthChange(e.target.value)}
                                className="font-mono font-bold"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="heightPx"
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground">Height</FormLabel>
                          <FormControl>
                            <Input
                                type="number"
                                value={displayHeight}
                                onChange={(e) => handleHeightChange(e.target.value)}
                                className="font-mono font-bold"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-muted-foreground">Unit</FormLabel>
                          <Select onValueChange={handleUnitChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="font-bold bg-card">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="px">px</SelectItem>
                              <SelectItem value="mm">mm</SelectItem>
                              <SelectItem value="cm">cm</SelectItem>
                              <SelectItem value="in">in</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-between px-2">
                    <FormLabel className="text-foreground">Orientation</FormLabel>
                    <div className="flex bg-muted p-1 rounded-xl">
                        <button
                            type="button"
                            onClick={() => orientation !== 'portrait' && toggleOrientation()}
                            className={cn("px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors", orientation === 'portrait' ? "bg-card shadow text-foreground" : "text-muted-foreground")}
                        >
                            Portrait
                        </button>
                        <button
                            type="button"
                            onClick={() => orientation !== 'landscape' && toggleOrientation()}
                            className={cn("px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors", orientation === 'landscape' ? "bg-card shadow text-foreground" : "text-muted-foreground")}
                        >
                            Landscape
                        </button>
                    </div>
                  </div>

                  {/* Live Mini Preview Box */}
                  <div className="flex flex-col items-center justify-center pt-2">
                      <div className="relative flex items-center justify-center w-full h-32 bg-muted/40 rounded-xl border border-border overflow-hidden">
                          {/* Standard A4 reference background (210x297) -> aspect ratio 1:1.414 */}
                          <div className="absolute border border-border border-dashed" style={{ width: '60px', height: '85px' }} />
                          {/* The actual canvas preview (relative ratio) */}
                          <div
                            className="bg-card border-2 border-primary shadow-md z-10 transition-all duration-300 flex items-center justify-center"
                            style={{
                                // Scale relative to a reference 100px. A max bounding box logic for the preview tile
                                width: Math.min((widthPx / Math.max(widthPx, heightPx)) * 100, 100),
                                height: Math.min((heightPx / Math.max(widthPx, heightPx)) * 100, 100)
                            }}
                          >
                            <span className="text-[10px] text-muted-foreground/60 font-mono rotate-45 pointer-events-none tracking-widest leading-none">CANVAS</span>
                          </div>
                          <span className="absolute bottom-2 right-3 text-[10px] text-muted-foreground font-medium">Relative to A4 Size</span>
                      </div>
                  </div>
                </div>
              )}

              {/* --- STEP 3: Print Settings --- */}
              {step === 3 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="pageCount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Number of Pages</FormLabel>
                            <FormControl>
                              <Input type="number" min={1} max={20} className="rounded-xl w-32 font-bold text-center" {...field} onChange={e => field.onChange(parseInt(e.target.value)||1)} />
                            </FormControl>
                            <p className="text-[11px] text-muted-foreground mt-1">Cards usually 1 page, Portfolios 2+.</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {pages === 1 && (
                          <FormField
                            control={form.control}
                            name="hasBackSide"
                            render={({ field }) => (
                              <FormItem className="flex flex-col justify-start">
                                <FormLabel className="mb-3 block pt-1">Has Back Side?</FormLabel>
                                <div className="flex flex-wrap items-center gap-3">
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={(checked) => {
                                            field.onChange(checked);
                                            setValue('pageCount', checked ? 2 : 1, { shouldValidate: true });
                                        }}
                                    />
                                    <span className="text-sm font-semibold">{field.value ? 'Yes (Double-sided)' : 'No (Single-sided)'}</span>
                                </div>
                              </FormItem>
                            )}
                          />
                      )}
                  </div>

                  <hr className="border-border" />

                  <FormField
                    control={form.control}
                    name="bleedMm"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between max-w-sm">
                            <FormLabel className="flex items-center gap-2">Bleed Margin ({unit}) <span title="Extra area around canvas for safe print trimming" className="text-muted-foreground/60 cursor-help">ⓘ</span></FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    step="any"
                                    className="w-20 text-center font-bold"
                                    {...field}
                                    value={formatUnit(fromPx(field.value, 'mm'), unit) /* We just format the underlying mm value into the selected display unit temporarily for UI.*/}
                                    onChange={e => {
                                        const parsed = parseFloat(e.target.value) || 0;
                                        // Store in DB consistently as mm, so we convert the user's unit input back to mm via PX
                                        const pxValue = toPx(parsed, unit);
                                        const mmValue = fromPx(pxValue, 'mm');
                                        field.onChange(mmValue);
                                    }}
                                />
                            </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dpi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Print Resolution <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(val: string) => field.onChange(Number(val))}
                            defaultValue={field.value.toString()}
                            className="space-y-1"
                          >
                            <div className="flex items-center space-x-3 bg-muted/40 p-3 rounded-lg border border-border">
                                <RadioGroupItem value="72" id="r1" />
                                <FormLabel htmlFor="r1" className="font-medium cursor-pointer">Screen Quality (72 DPI) <span className="text-muted-foreground font-normal">— digital only</span></FormLabel>
                            </div>
                            <div className="flex items-center space-x-3 bg-muted/40 p-3 rounded-lg border border-border">
                                <RadioGroupItem value="300" id="r2" />
                                <FormLabel htmlFor="r2" className="font-medium cursor-pointer">Print Quality (300 DPI) <span className="text-muted-foreground font-normal">— standard print</span></FormLabel>
                            </div>
                            <div className="flex items-center space-x-3 bg-muted/40 p-3 rounded-lg border border-border">
                                <RadioGroupItem value="600" id="r3" />
                                <FormLabel htmlFor="r3" className="font-medium cursor-pointer">High Quality (600 DPI) <span className="text-muted-foreground font-normal">— professional press</span></FormLabel>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="colorMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color Mode <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-wrap gap-4"
                          >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="rgb" id="c1" />
                                <FormLabel htmlFor="c1" className="cursor-pointer font-medium">RGB <span className="text-muted-foreground font-normal text-xs">(Digital)</span></FormLabel>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="cmyk" id="c2" />
                                <FormLabel htmlFor="c2" className="cursor-pointer font-medium">CMYK-ready <span className="text-muted-foreground font-normal text-xs">(Print)</span></FormLabel>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mt-6">
                      <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1.5 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary block"></span> Summary
                      </p>
                      <p className="text-xs text-foreground leading-relaxed font-medium">
                          You are creating a <span className="font-bold">{watch('serviceType')?.replace('_', ' ') || 'Template'}</span>
                          {' '}({Math.round(fromPx(widthPx, 'mm'))}×{Math.round(fromPx(heightPx, 'mm'))}mm)
                          for <span className="font-bold">{watch('targetAudience')}</span> audiences.
                          <br />
                          <span className="text-muted-foreground mt-1 block">Settings: {pages} page(s) · {watch('hasBackSide') ? 'Double' : 'Single'}-sided · {watch('dpi')} DPI · {watch('colorMode').toUpperCase()}</span>
                      </p>
                  </div>
                </div>
              )}

              {/* --- Footer Controls --- */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBack}
                    disabled={step === 1 || createTemplate.isPending}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>

                {step < 3 ? (
                  <Button type="button" onClick={handleNext} className="rounded-xl px-6">
                    Next Step <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                      type="submit"
                      className="w-full"
                      disabled={createTemplate.isPending}
                  >
                      {createTemplate.isPending ? (
                        <>
                          <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                          Creating...
                        </>
                      ) : 'Create Template'}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
