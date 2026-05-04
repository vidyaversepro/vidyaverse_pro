// strictly typed structure for studio JSON payloads

export interface TemplateCanvasConfig {
    widthMm: number;
    heightMm: number;
    scale: number;
    bgColor: string;
}

export interface BaseElement {
    id: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    opacity?: number;
    zIndex?: number;
}

export interface TemplateTextElement extends BaseElement {
    type: 'text';
    text: string;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
}

export interface TemplateImageElement extends BaseElement {
    type: 'image';
    src: string;
}

export interface TemplateShapeElement extends BaseElement {
    type: 'shape';
    shapeType: 'rect' | 'circle' | 'line';
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}

export interface TemplateQrElement extends BaseElement {
    type: 'qr';
    value: string;
}

export interface TemplateBarcodeElement extends BaseElement {
    type: 'barcode';
    value: string;
    format?: string;
}

export type TemplateElement =
    | TemplateTextElement
    | TemplateImageElement
    | TemplateShapeElement
    | TemplateQrElement
    | TemplateBarcodeElement;

export interface TemplateDocument {
    version: '1.0';
    elements: TemplateElement[];
    canvasConfig: TemplateCanvasConfig;
}
