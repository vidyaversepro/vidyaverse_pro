import { z } from 'zod';

// Shared Primitive Types
export const EdgeSpacingSchema = z.object({
  top: z.number(),
  right: z.number(),
  bottom: z.number(),
  left: z.number(),
});

export const BorderStyleSchema = z.object({
  width: z.number(),
  color: z.string(),
  style: z.enum(['solid', 'dashed', 'dotted', 'none']),
  radius: z.number().optional(),
});

export const BoxShadowSchema = z.object({
  x: z.number(),
  y: z.number(),
  blur: z.number(),
  spread: z.number(),
  color: z.string(),
});

export const ImageFilterSchema = z.object({
  brightness: z.number().optional(),
  contrast: z.number().optional(),
  saturation: z.number().optional(),
  grayscale: z.boolean().optional(),
  sepia: z.boolean().optional(),
});

// Canvas Configuration
export const TemplateCanvasConfigSchema = z.object({
  widthMm: z.number(),
  heightMm: z.number(),
  widthPx: z.number(),
  heightPx: z.number(),
  dpi: z.union([z.literal(72), z.literal(150), z.literal(300)]),
  scale: z.number(),
  bgColor: z.string(),
  bgImageUrl: z.string().optional(),
  orientation: z.enum(['portrait', 'landscape']),
  bleedMm: z.number(),
  colorMode: z.enum(['rgb', 'cmyk']),
});

// Element Base
export const BaseElementSchema = z.object({
  id: z.string().uuid(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number(),
  opacity: z.number().min(0).max(1),
  zIndex: z.number(),
  locked: z.boolean(),
  visible: z.boolean(),
  name: z.string().optional(),
});

// Text Element
export const TextElementSchema = BaseElementSchema.extend({
  type: z.literal('text'),
  content: z.string(),
  fontFamily: z.string(),
  fontSize: z.number(),
  fontWeight: z.enum(['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900']),
  fontStyle: z.enum(['normal', 'italic']),
  textAlign: z.enum(['left', 'center', 'right', 'justify']),
  verticalAlign: z.enum(['top', 'middle', 'bottom']),
  color: z.string(),
  lineHeight: z.number(),
  letterSpacing: z.number(),
  textDecoration: z.enum(['none', 'underline', 'line-through']),
  textTransform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']),
  padding: EdgeSpacingSchema,
  backgroundColor: z.string().optional(),
  borderRadius: z.number().optional(),
  border: BorderStyleSchema.optional(),
  wordWrap: z.boolean(),
  overflow: z.enum(['visible', 'hidden', 'clip']),
});

// Image Element
export const ImageElementSchema = BaseElementSchema.extend({
  type: z.literal('image'),
  src: z.string(),
  fallbackSrc: z.string(),
  objectFit: z.enum(['fill', 'contain', 'cover', 'none']),
  objectPosition: z.string(),
  borderRadius: z.number().optional(),
  border: BorderStyleSchema.optional(),
  filter: ImageFilterSchema.optional(),
  aspectRatioLocked: z.boolean(),
});

// Shape Element
export const ShapeElementSchema = BaseElementSchema.extend({
  type: z.literal('shape'),
  shape: z.enum(['rectangle', 'circle', 'ellipse', 'rounded-rectangle', 'triangle']),
  fill: z.string(),
  border: BorderStyleSchema.optional(),
  borderRadius: z.number().optional(),
  shadow: BoxShadowSchema.optional(),
});

// QR Code Element
export const QrElementSchema = BaseElementSchema.extend({
  type: z.literal('qr'),
  data: z.string(),
  errorCorrection: z.enum(['L', 'M', 'Q', 'H']),
  fgColor: z.string(),
  bgColor: z.string(),
  includeMargin: z.boolean(),
});

// Barcode Element
export const BarcodeElementSchema = BaseElementSchema.extend({
  type: z.literal('barcode'),
  data: z.string(),
  format: z.enum(['CODE128', 'CODE39', 'EAN13', 'QR']),
  showText: z.boolean(),
  lineColor: z.string(),
  background: z.string(),
});

// Line Element
export const LineElementSchema = BaseElementSchema.extend({
  type: z.literal('line'),
  direction: z.enum(['horizontal', 'vertical', 'diagonal']),
  stroke: z.string(),
  strokeWidth: z.number(),
  strokeDash: z.array(z.number()).optional(),
});

// Table Cell
export const TableCellSchema = z.object({
  content: z.string(),
  colSpan: z.number().optional(),
  rowSpan: z.number().optional(),
  align: z.enum(['left', 'center', 'right']),
});

// Table Row
export const TableRowSchema = z.object({
  cells: z.array(TableCellSchema),
  isHeader: z.boolean(),
});

// Table Element
export const TableElementSchema = BaseElementSchema.extend({
  type: z.literal('table'),
  rows: z.array(TableRowSchema),
  borderColor: z.string(),
  borderWidth: z.number(),
  headerBg: z.string(),
  headerTextColor: z.string(),
  cellPadding: EdgeSpacingSchema,
  fontSize: z.number(),
});

export const TemplateElementSchema = z.discriminatedUnion('type', [
  TextElementSchema,
  ImageElementSchema,
  ShapeElementSchema,
  QrElementSchema,
  BarcodeElementSchema,
  LineElementSchema,
  TableElementSchema,
]);

// Page Structure
export const GuideSchema = z.object({
  id: z.string(),
  orientation: z.enum(['horizontal', 'vertical']),
  position: z.number(),
});

export const TemplatePageSchema = z.object({
  id: z.string().uuid(),
  pageNumber: z.number(),
  label: z.string(),
  elements: z.array(TemplateElementSchema),
  bgColor: z.string().optional(),
  bgImageUrl: z.string().optional(),
  guides: z.array(GuideSchema),
});

// Print Config
export const TemplatePrintConfigSchema = z.object({
  pageCount: z.number(),
  hasBackSide: z.boolean(),
  bleedMm: z.number(),
  dpi: z.union([z.literal(72), z.literal(150), z.literal(300)]),
  colorMode: z.enum(['rgb', 'cmyk']),
  cardsPerSheet: z.number().optional(),
  gutterMm: z.number().optional(),
});

// Metadata
export const TemplateMetadataSchema = z.object({
  serviceType: z.string(),
  targetAudience: z.enum(['STUDENT', 'STAFF', 'ALL']),
  tags: z.array(z.string()),
  lastEditedBy: z.string().optional(),
  previewImageUrl: z.string().optional(),
});

// Root Document
export const TemplateDocumentSchema = z.object({
  version: z.literal('1.0'),
  canvasConfig: TemplateCanvasConfigSchema,
  pages: z.array(TemplatePageSchema),
  printConfig: TemplatePrintConfigSchema,
  metadata: TemplateMetadataSchema,
});

// Inferred Types
export type EdgeSpacing = z.infer<typeof EdgeSpacingSchema>;
export type BorderStyle = z.infer<typeof BorderStyleSchema>;
export type BoxShadow = z.infer<typeof BoxShadowSchema>;
export type ImageFilter = z.infer<typeof ImageFilterSchema>;
export type TemplateCanvasConfig = z.infer<typeof TemplateCanvasConfigSchema>;
export type BaseElement = z.infer<typeof BaseElementSchema>;
export type TextElement = z.infer<typeof TextElementSchema>;
export type ImageElement = z.infer<typeof ImageElementSchema>;
export type ShapeElement = z.infer<typeof ShapeElementSchema>;
export type QrElement = z.infer<typeof QrElementSchema>;
export type BarcodeElement = z.infer<typeof BarcodeElementSchema>;
export type LineElement = z.infer<typeof LineElementSchema>;
export type TableCell = z.infer<typeof TableCellSchema>;
export type TableRow = z.infer<typeof TableRowSchema>;
export type TableElement = z.infer<typeof TableElementSchema>;
export type TemplateElement = z.infer<typeof TemplateElementSchema>;
export type Guide = z.infer<typeof GuideSchema>;
export type TemplatePage = z.infer<typeof TemplatePageSchema>;
export type TemplatePrintConfig = z.infer<typeof TemplatePrintConfigSchema>;
export type TemplateMetadata = z.infer<typeof TemplateMetadataSchema>;
export type TemplateDocument = z.infer<typeof TemplateDocumentSchema>;
