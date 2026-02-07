import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Eraser, Pencil, Trash2, Square, ArrowRight, Type, Circle as CircleIcon, Move, Undo2 } from 'lucide-react';
import { Button, Card } from '../../components/ui';

interface DrawingCanvasProps {
    onExport: (dataUrl: string) => void;
    initialImage?: string | null;
    onChange?: (dataUrl: string) => void;
    buttonLabel?: string;
}

type ToolType = 'select' | 'pen' | 'eraser' | 'rect' | 'circle' | 'arrow' | 'text';

// Text size presets
const TEXT_SIZES = {
    small: { label: 'S', size: 16 },
    medium: { label: 'M', size: 24 },
    large: { label: 'L', size: 36 },
} as const;

type TextSizeKey = keyof typeof TEXT_SIZES;

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onExport, initialImage, onChange, buttonLabel = 'Process Sketch' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState<ToolType>('pen');
    const [lineWidth, setLineWidth] = useState(3);
    const [textSize, setTextSize] = useState<TextSizeKey>('medium');

    // For shapes
    const startPos = useRef<{ x: number, y: number } | null>(null);
    const snapshot = useRef<ImageData | null>(null);

    // For text
    const [activeText, setActiveText] = useState<{ x: number, y: number, screenX: number, screenY: number, value: string } | null>(null);
    const textInputRef = useRef<HTMLInputElement>(null);

    // For select/move tool
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef<{ x: number, y: number } | null>(null);
    const canvasBeforeDrag = useRef<ImageData | null>(null);

    // Undo stack
    const [history, setHistory] = useState<ImageData[]>([]);
    const maxHistory = 20;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#0f172a'; // Slate 900 for drawing

        // Fill background with white
        ctx.fillStyle = '#ffffff'; // White
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    // Restore image when initialImage changes or on mount
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !initialImage) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.src = initialImage;
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear before restoring
            ctx.drawImage(img, 0, 0);
        };
    }, [initialImage]);

    // Focus text input when active
    useEffect(() => {
        if (activeText && textInputRef.current) {
            textInputRef.current.focus();
        }
    }, [activeText]);

    const saveToHistory = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory(prev => {
            const newHistory = [...prev, imageData];
            if (newHistory.length > maxHistory) {
                newHistory.shift();
            }
            return newHistory;
        });
    }, []);

    const undo = useCallback(() => {
        if (history.length === 0) return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const newHistory = [...history];
        const lastState = newHistory.pop();
        if (lastState) {
            ctx.putImageData(lastState, 0, 0);
            setHistory(newHistory);
            if (onChange) {
                onChange(canvas.toDataURL('image/png'));
            }
        }
    }, [history, onChange]);

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0, screenX: 0, screenY: 0 };

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        let clientX, clientY;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
            screenX: clientX - rect.left,
            screenY: clientY - rect.top
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        // Handle select/move tool
        if (tool === 'select') {
            e.preventDefault();
            const { x, y } = getCoordinates(e);
            setIsDragging(true);
            dragStartPos.current = { x, y };

            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (canvas && ctx) {
                // Save current canvas state before dragging
                saveToHistory();
                canvasBeforeDrag.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
            }
            return;
        }

        // If we are in text mode, handle placement or commit
        if (tool === 'text') {
            e.preventDefault(); // Prevent default to stop focus loss issues
            if (activeText) {
                commitText();
            } else {
                saveToHistory();
                const { x, y, screenX, screenY } = getCoordinates(e);
                setActiveText({ x, y, screenX, screenY, value: '' });
            }
            return;
        }

        // If we have active text open and switch tools/click elsewhere, commit it first?
        // Simpler: if activeText is present, ignores other drawing until committed/cancelled
        if (activeText) {
            commitText();
            return;
        }

        e.preventDefault();
        saveToHistory();
        setIsDrawing(true);
        const { x, y } = getCoordinates(e);
        startPos.current = { x, y };

        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx || !canvasRef.current) return;

        // Save snapshot for shapes
        if (['rect', 'circle', 'arrow'].includes(tool)) {
            snapshot.current = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        }

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : '#0f172a';
        ctx.lineWidth = tool === 'eraser' ? 20 : lineWidth;
        ctx.shadowBlur = 0; // No glow
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        // Handle select/move tool dragging
        if (tool === 'select' && isDragging) {
            e.preventDefault();
            const { x, y } = getCoordinates(e);
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');

            if (!canvas || !ctx || !dragStartPos.current || !canvasBeforeDrag.current) return;

            const dx = x - dragStartPos.current.x;
            const dy = y - dragStartPos.current.y;

            // Clear and offset the entire canvas content
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Create a temporary canvas to hold the original image
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d');
            if (tempCtx) {
                tempCtx.putImageData(canvasBeforeDrag.current, 0, 0);
                ctx.drawImage(tempCanvas, dx, dy);
            }
            return;
        }

        if (!isDrawing) return;
        e.preventDefault(); // Prevent scrolling

        const { x, y } = getCoordinates(e);
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx || !canvasRef.current || !startPos.current) return;

        if (tool === 'pen' || tool === 'eraser') {
            ctx.lineTo(x, y);
            ctx.stroke();
        } else if (tool === 'rect') {
            if (snapshot.current) {
                ctx.putImageData(snapshot.current, 0, 0);
            }
            const width = x - startPos.current.x;
            const height = y - startPos.current.y;
            ctx.beginPath();
            ctx.rect(startPos.current.x, startPos.current.y, width, height);
            ctx.stroke();
        } else if (tool === 'circle') {
            if (snapshot.current) {
                ctx.putImageData(snapshot.current, 0, 0);
            }
            const dx = x - startPos.current.x;
            const dy = y - startPos.current.y;
            const radius = Math.sqrt(dx * dx + dy * dy);
            ctx.beginPath();
            ctx.arc(startPos.current.x, startPos.current.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (tool === 'arrow') {
            if (snapshot.current) {
                ctx.putImageData(snapshot.current, 0, 0);
            }
            drawArrow(ctx, startPos.current.x, startPos.current.y, x, y);
        }
    };

    const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) => {
        const headLength = 20; // length of head in pixels
        const dx = toX - fromX;
        const dy = toY - fromY;
        const angle = Math.atan2(dy, dx);

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY + headLength * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
    };

    const stopDrawing = () => {
        // Handle select/move tool
        if (tool === 'select' && isDragging) {
            setIsDragging(false);
            dragStartPos.current = null;
            canvasBeforeDrag.current = null;

            if (onChange && canvasRef.current) {
                onChange(canvasRef.current.toDataURL('image/png'));
            }
            return;
        }

        if (isDrawing) {
            setIsDrawing(false);
            const ctx = canvasRef.current?.getContext('2d');
            ctx?.closePath();

            // Auto-save
            if (onChange && canvasRef.current) {
                onChange(canvasRef.current.toDataURL('image/png'));
            }

            startPos.current = null;
            snapshot.current = null;
        }
    };

    const commitText = () => {
        if (!activeText || !canvasRef.current) return;

        if (activeText.value.trim()) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                const fontSize = TEXT_SIZES[textSize].size;
                ctx.font = `${fontSize}px Inter, sans-serif`;
                ctx.fillStyle = '#0f172a';
                ctx.fillText(activeText.value, activeText.x, activeText.y + fontSize);

                if (onChange) {
                    onChange(canvasRef.current.toDataURL('image/png'));
                }
            }
        }
        setActiveText(null);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
            saveToHistory();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            if (onChange) {
                onChange(canvas.toDataURL('image/png'));
            }
        }
    };

    const handleExport = () => {
        if (canvasRef.current) {
            onExport(canvasRef.current.toDataURL('image/png'));
        }
    };

    const getCursor = () => {
        switch (tool) {
            case 'select': return 'move';
            case 'text': return 'text';
            case 'eraser': return 'cell';
            default: return 'crosshair';
        }
    };

    return (
        <Card className="flex flex-col h-full w-full overflow-hidden shadow-lg shadow-slate-200/50 border-0 relative">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 bg-white border-b border-slate-100 z-10 relative">
                <div className="flex gap-1 items-center flex-wrap">
                    {/* Select/Move Tool */}
                    <Button
                        onClick={() => setTool('select')}
                        variant={tool === 'select' ? 'primary' : 'ghost'}
                        title="Select & Move"
                        size="sm"
                    >
                        <Move size={18} />
                    </Button>

                    <div className="w-px h-6 bg-slate-200 mx-1" />

                    {/* Drawing Tools */}
                    <Button
                        onClick={() => setTool('pen')}
                        variant={tool === 'pen' ? 'primary' : 'ghost'}
                        title="Pencil Tool"
                        size="sm"
                    >
                        <Pencil size={18} />
                    </Button>
                    <Button
                        onClick={() => setTool('rect')}
                        variant={tool === 'rect' ? 'primary' : 'ghost'}
                        title="Rectangle Tool"
                        size="sm"
                    >
                        <Square size={18} />
                    </Button>
                    <Button
                        onClick={() => setTool('circle')}
                        variant={tool === 'circle' ? 'primary' : 'ghost'}
                        title="Circle Tool"
                        size="sm"
                    >
                        <CircleIcon size={18} />
                    </Button>
                    <Button
                        onClick={() => setTool('arrow')}
                        variant={tool === 'arrow' ? 'primary' : 'ghost'}
                        title="Arrow Tool"
                        size="sm"
                    >
                        <ArrowRight size={18} />
                    </Button>
                    <Button
                        onClick={() => setTool('text')}
                        variant={tool === 'text' ? 'primary' : 'ghost'}
                        title="Text Tool"
                        size="sm"
                    >
                        <Type size={18} />
                    </Button>
                    <Button
                        onClick={() => setTool('eraser')}
                        variant={tool === 'eraser' ? 'primary' : 'ghost'}
                        title="Eraser Tool"
                        size="sm"
                    >
                        <Eraser size={18} />
                    </Button>

                    <div className="w-px h-6 bg-slate-200 mx-1" />

                    {/* Line Width (for pen/shapes) */}
                    {(tool === 'pen' || tool === 'rect' || tool === 'circle' || tool === 'arrow') && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Size</span>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={lineWidth}
                                onChange={(e) => setLineWidth(Number(e.target.value))}
                                className="w-20 accent-primary cursor-pointer"
                                title="Line Width"
                            />
                        </div>
                    )}

                    {/* Text Size Selector */}
                    {tool === 'text' && (
                        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                            {(Object.keys(TEXT_SIZES) as TextSizeKey[]).map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setTextSize(size)}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${textSize === size
                                            ? 'bg-white text-primary shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                    title={`${size.charAt(0).toUpperCase() + size.slice(1)} Text (${TEXT_SIZES[size].size}px)`}
                                >
                                    {TEXT_SIZES[size].label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-1">
                    {/* Undo */}
                    <Button
                        onClick={undo}
                        variant="ghost"
                        title="Undo (Ctrl+Z)"
                        size="sm"
                        disabled={history.length === 0}
                        className="text-slate-500"
                    >
                        <Undo2 size={16} />
                    </Button>

                    {/* Clear */}
                    <Button
                        onClick={clearCanvas}
                        variant="ghost"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-1.5 px-2"
                        title="Clear Canvas"
                        size="sm"
                    >
                        <Trash2 size={16} />
                        <span className="font-medium hidden sm:inline">Clear</span>
                    </Button>
                </div>
            </div>

            {/* Canvas Area */}
            <div
                className="flex-1 relative overflow-hidden touch-none bg-white"
                style={{ cursor: getCursor() }}
            >
                {/* Dot grid for minimalist feel */}
                <div className="absolute inset-0 opacity-40 pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                        backgroundSize: '24px 24px'
                    }}
                ></div>

                <canvas
                    ref={canvasRef}
                    width={1280}
                    height={720}
                    className="w-full h-full object-contain"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />

                {/* Text Input Overlay */}
                {activeText && (
                    <input
                        ref={textInputRef}
                        type="text"
                        value={activeText.value}
                        onChange={(e) => setActiveText({ ...activeText, value: e.target.value })}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') commitText();
                            if (e.key === 'Escape') setActiveText(null);
                        }}
                        onBlur={commitText}
                        style={{
                            position: 'absolute',
                            left: activeText.screenX,
                            top: activeText.screenY,
                            zIndex: 50,
                            fontFamily: 'Inter, sans-serif',
                            fontSize: `${TEXT_SIZES[textSize].size}px`,
                            color: '#0f172a',
                            background: 'white',
                            border: '2px solid #4f46e5',
                            borderRadius: '6px',
                            outline: 'none',
                            padding: '4px 10px',
                            minWidth: '120px',
                            transform: 'translateY(-50%)',
                            boxShadow: '0 4px 12px rgb(0 0 0 / 0.15)',
                        }}
                        placeholder="Type here..."
                        autoFocus
                    />
                )}

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 shadow-sm border border-slate-200 text-slate-400 text-xs px-4 py-1.5 rounded-full pointer-events-none font-medium z-0">
                    {tool === 'select' ? 'Click and drag to move content' : 'Draw your architecture'}
                </div>
            </div>

            {/* Footer Action */}
            <div className="p-4 bg-white border-t border-slate-100 flex justify-end z-10 relative">
                <Button
                    onClick={handleExport}
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto"
                >
                    {buttonLabel}
                </Button>
            </div>
        </Card>
    );
};

export default DrawingCanvas;
