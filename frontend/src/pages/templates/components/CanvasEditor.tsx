import React, { useRef, useEffect, useMemo } from 'react';
import { Stage, Layer, Text, Rect, Circle, Line, Image as KonvaImage, Transformer } from 'react-konva';
import useImage from 'use-image';
import { useEditorStore, TemplateElement, CanvasConfig } from '../store/editor.store';
import { KonvaEventObject } from 'konva/lib/Node';
import { unitConversions } from '@vidyaverse/shared-validation';
import { Ruler, RulerCorner, RULER_SIZE } from './Ruler';

// ─── Background Layer ───────────────────────────────────────────
const CanvasBackground = ({ config, width, height }: { config: CanvasConfig & { bgImage?: string }; width: number; height: number }) => {
    const [image] = useImage(config.bgImage || '');
    return (
        <Layer id="bg-layer">
            <Rect width={width} height={height} fill={config.bgColor || '#ffffff'} />
            {image && <KonvaImage image={image} width={width} height={height} />}
        </Layer>
    );
};

// ─── Grid Overlay Layer ─────────────────────────────────────────
const GridLayer = ({ width, height, gridSizePx }: { width: number; height: number; gridSizePx: number }) => {
    const lines = useMemo(() => {
        const result: React.ReactNode[] = [];
        // Vertical lines
        for (let x = gridSizePx; x < width; x += gridSizePx) {
            result.push(
                <Line
                    key={`gv-${x}`}
                    points={[x, 0, x, height]}
                    stroke="#b7102a"
                    strokeWidth={0.5}
                    opacity={0.18}
                    dash={[4, 4]}
                    listening={false}
                />
            );
        }
        // Horizontal lines
        for (let y = gridSizePx; y < height; y += gridSizePx) {
            result.push(
                <Line
                    key={`gh-${y}`}
                    points={[0, y, width, y]}
                    stroke="#b7102a"
                    strokeWidth={0.5}
                    opacity={0.18}
                    dash={[4, 4]}
                    listening={false}
                />
            );
        }
        return result;
    }, [width, height, gridSizePx]);

    return <Layer id="grid-layer" listening={false}>{lines}</Layer>;
};

// ─── Shared drag / transform handlers ───────────────────────────
type ChangeHandler = (newAttrs: Partial<TemplateElement>) => void;

const snapToGridValue = (value: number, gridPx: number) => Math.round(value / gridPx) * gridPx;

const useDragAndTransform = (
    _element: TemplateElement,
    onChange: ChangeHandler,
    isSelected: boolean
) => {
    const shapeRef = useRef<any>(null);
    const trRef = useRef<any>(null);
    const { snapToGrid, gridSizeMm } = useEditorStore();
    const gridSizePx = unitConversions.mmToPx(gridSizeMm);

    useEffect(() => {
        if (isSelected && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer()?.batchDraw();
        }
    }, [isSelected]);

    const onDragEnd = (e: KonvaEventObject<DragEvent>) => {
        let x = e.target.x();
        let y = e.target.y();
        if (snapToGrid && gridSizePx > 0) {
            x = snapToGridValue(x, gridSizePx);
            y = snapToGridValue(y, gridSizePx);
            e.target.x(x);
            e.target.y(y);
        }
        onChange({ x, y });
    };

    const onTransformEnd = () => {
        const node = shapeRef.current;
        if (!node) return;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        let x = node.x();
        let y = node.y();
        let w = Math.max(5, node.width() * scaleX);
        let h = Math.max(5, node.height() * scaleY);
        if (snapToGrid && gridSizePx > 0) {
            x = snapToGridValue(x, gridSizePx);
            y = snapToGridValue(y, gridSizePx);
            w = Math.max(gridSizePx, snapToGridValue(w, gridSizePx));
            h = Math.max(gridSizePx, snapToGridValue(h, gridSizePx));
        }
        onChange({
            x, y,
            width: w,
            height: h,
            rotation: node.rotation(),
        });
    };

    return { shapeRef, trRef, onDragEnd, onTransformEnd };
};

// ─── Image Element ──────────────────────────────────────────────
const URLImage = ({ element, isSelected, onSelect, onChange }: {
    element: TemplateElement;
    isSelected: boolean;
    onSelect: (e: KonvaEventObject<MouseEvent | TouchEvent>) => void;
    onChange: ChangeHandler;
}) => {
    const { shapeRef, trRef, onDragEnd, onTransformEnd } = useDragAndTransform(element, onChange, isSelected);
    const [image] = useImage(element.src || element.fallbackSrc || 'https://via.placeholder.com/150');

    return (
        <React.Fragment>
            <KonvaImage
                image={image}
                onClick={onSelect}
                onTap={onSelect}
                ref={shapeRef}
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                rotation={element.rotation}
                opacity={element.opacity}
                draggable={!element.locked}
                visible={element.visible}
                onDragEnd={onDragEnd}
                onTransformEnd={onTransformEnd}
            />
            {isSelected && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => (newBox.width < 5 || newBox.height < 5) ? oldBox : newBox}
                />
            )}
        </React.Fragment>
    );
};

// ─── Generic Element Renderer (text, shape, line, qr, barcode) ──
const ElementRenderer = ({ element, isSelected, onSelect, onChange }: {
    element: TemplateElement;
    isSelected: boolean;
    onSelect: (e: KonvaEventObject<MouseEvent | TouchEvent>) => void;
    onChange: ChangeHandler;
}) => {
    const { shapeRef, trRef, onDragEnd, onTransformEnd } = useDragAndTransform(element, onChange, isSelected);

    const commonProps = {
        onClick: onSelect,
        onTap: onSelect,
        ref: shapeRef,
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        rotation: element.rotation || 0,
        opacity: element.opacity ?? 1,
        draggable: !element.locked,
        visible: element.visible !== false,
        onDragEnd,
        onTransformEnd,
    };

    const renderShape = () => {
        switch (element.type) {
            case 'text':
                return (
                    <Text
                        {...commonProps}
                        text={element.text || 'Text'}
                        fontSize={element.fontSize || 16}
                        fontFamily={element.fontFamily || 'Inter'}
                        fill={element.fill || '#000000'}
                        align={element.align || 'left'}
                        fontStyle={
                            `${element.fontWeight === 'bold' ? 'bold' : 'normal'} ${element.fontStyle === 'italic' ? 'italic' : ''}`
                                .trim()
                        }
                        textDecoration={element.textDecoration || 'none'}
                        letterSpacing={element.letterSpacing || 0}
                        lineHeight={element.lineHeight || 1.4}
                    />
                );
            case 'shape':
                if (element.shapeType === 'circle') {
                    return (
                        <Circle
                            {...commonProps}
                            x={(element.x || 0) + element.width / 2}
                            y={(element.y || 0) + element.height / 2}
                            radius={element.width / 2}
                            fill={element.fill || '#cccccc'}
                            stroke={element.stroke}
                            strokeWidth={element.strokeWidth}
                        />
                    );
                }
                return (
                    <Rect
                        {...commonProps}
                        fill={element.fill || '#cccccc'}
                        stroke={element.stroke}
                        strokeWidth={element.strokeWidth}
                        cornerRadius={element.cornerRadius}
                    />
                );
            case 'line':
                return (
                    <Line
                        {...commonProps}
                        points={[0, 0, element.width, element.direction === 'vertical' ? element.height : 0]}
                        stroke={element.stroke || '#191c1d'}
                        strokeWidth={element.strokeWidth || 2}
                        dash={element.strokeDash}
                    />
                );
            case 'qr':
                // Render as a placeholder rect on canvas → actual QR is rendered at PDF-time
                return (
                    <Rect
                        {...commonProps}
                        fill="#f0f0f0"
                        stroke="#999"
                        strokeWidth={1}
                        cornerRadius={4}
                    />
                );
            case 'barcode':
                return (
                    <Rect
                        {...commonProps}
                        fill="#f0f0f0"
                        stroke="#999"
                        strokeWidth={1}
                    />
                );
            default:
                return (
                    <Rect
                        {...commonProps}
                        fill="#e0e0e0"
                        stroke="#bbb"
                        strokeWidth={1}
                    />
                );
        }
    };

    return (
        <React.Fragment>
            {renderShape()}
            {isSelected && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) =>
                        (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) ? oldBox : newBox
                    }
                />
            )}
        </React.Fragment>
    );
};


// ─── Main Canvas ────────────────────────────────────────────────
export default function CanvasEditor({ zoom = 100 }: { zoom?: number }) {
    const store = useEditorStore();
    const currentPage = store.pages.find(p => p.id === store.currentPageId);
    const elements = currentPage?.elements || [];
    const { selectedNodeIds, toggleNodeSelection, setSelectedNodeIds, updateElement, canvasConfig, showGrid, gridSizeMm } = store;
    
    const effectiveConfig = {
        ...canvasConfig,
        bgColor: currentPage?.bgColor ?? canvasConfig.bgColor,
        bgImage: currentPage?.bgImage !== undefined
            ? (currentPage.bgImage === null ? undefined : currentPage.bgImage)
            : canvasConfig.bgImage,
    };
    
    const mmToPxFactor = unitConversions.mmToPx(1); // px per 1 mm
    const zoomScale = (zoom / 100) * canvasConfig.scale;
    const canvasWidth = unitConversions.mmToPx(canvasConfig.widthMm);
    const canvasHeight = unitConversions.mmToPx(canvasConfig.heightMm);
    const gridSizePx = unitConversions.mmToPx(gridSizeMm);

    const checkDeselect = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) setSelectedNodeIds([]);
    };

    // Sort elements by zIndex for proper layering
    const sortedElements = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    return (
        <div
            className="relative"
            style={{
                width: canvasWidth * zoomScale + (showGrid ? RULER_SIZE : 0),
                height: canvasHeight * zoomScale + (showGrid ? RULER_SIZE : 0),
            }}
        >
            {/* Rulers (shown when grid is visible) */}
            {showGrid && (
                <>
                    <RulerCorner />
                    <Ruler orientation="horizontal" lengthPx={canvasWidth} mmToPx={mmToPxFactor} zoomScale={zoomScale} />
                    <Ruler orientation="vertical" lengthPx={canvasHeight} mmToPx={mmToPxFactor} zoomScale={zoomScale} />
                </>
            )}

            {/* Canvas */}
            <div
                style={{
                    position: showGrid ? 'absolute' : 'relative',
                    top: showGrid ? RULER_SIZE : 0,
                    left: showGrid ? RULER_SIZE : 0,
                    width: canvasWidth * zoomScale,
                    height: canvasHeight * zoomScale,
                    borderRadius: 6,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                }}
            >
                <Stage
                    width={canvasWidth * zoomScale}
                    height={canvasHeight * zoomScale}
                    onMouseDown={checkDeselect}
                    onTouchStart={checkDeselect}
                    scaleX={zoomScale}
                    scaleY={zoomScale}
                >
                    <CanvasBackground config={effectiveConfig} width={canvasWidth} height={canvasHeight} />
                    {showGrid && <GridLayer width={canvasWidth} height={canvasHeight} gridSizePx={gridSizePx} />}
                    <Layer id="elements-layer">
                        {sortedElements.map((el) => {
                            if (!el.visible) return null;
                            if (el.type === 'image') {
                                return (
                                    <URLImage
                                        key={el.id}
                                        element={el}
                                        isSelected={selectedNodeIds.includes(el.id)}
                                        onSelect={(e) => {
                                            if (el.locked) return;
                                            if (e.evt.shiftKey) {
                                                toggleNodeSelection(el.id);
                                            } else {
                                                setSelectedNodeIds([el.id]);
                                            }
                                        }}
                                        onChange={(newAttrs) => updateElement(el.id, newAttrs)}
                                    />
                                );
                            }
                            return (
                                <ElementRenderer
                                    key={el.id}
                                    element={el}
                                    isSelected={selectedNodeIds.includes(el.id)}
                                    onSelect={(e) => {
                                        if (el.locked) return;
                                        if (e.evt.shiftKey) {
                                            toggleNodeSelection(el.id);
                                        } else {
                                            setSelectedNodeIds([el.id]);
                                        }
                                    }}
                                    onChange={(newAttrs) => updateElement(el.id, newAttrs)}
                                />
                            );
                        })}
                    </Layer>
                </Stage>
            </div>
        </div>
    );
}
