import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Eraser, Pencil, Trash2, Undo } from 'lucide-react';

interface DrawingCanvasProps {
  onExport: (dataUrl: string) => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onExport }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [lineWidth, setLineWidth] = useState(3);
  
  // Initialize canvas context styling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#ffffff'; // White drawing on dark background
    
    // Fill background with dark color initially so exported image isn't transparent
    ctx.fillStyle = '#1e293b'; // Slate 800
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling on touch
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = tool === 'eraser' ? '#1e293b' : '#ffffff';
      ctx.lineWidth = tool === 'eraser' ? 20 : lineWidth;
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current?.getContext('2d');
    
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const ctx = canvasRef.current?.getContext('2d');
      ctx?.closePath();
      
      // Auto-save/export whenever a stroke finishes? 
      // Maybe not, let user click a button. But we can keep ref ready.
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleExport = () => {
    if (canvasRef.current) {
      onExport(canvasRef.current.toDataURL('image/png'));
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-700">
        <div className="flex gap-2">
          <button
            onClick={() => setTool('pen')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'pen' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
            title="Pencil Tool"
          >
            <Pencil size={20} />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'eraser' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
            title="Eraser Tool"
          >
            <Eraser size={20} />
          </button>
          <div className="w-px h-8 bg-slate-700 mx-2" />
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={lineWidth} 
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-24 accent-blue-500 my-auto"
            title="Brush Size"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearCanvas}
            className="p-2 rounded-lg bg-slate-800 text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors"
            title="Clear Canvas"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative cursor-crosshair overflow-hidden touch-none">
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="w-full h-full object-contain bg-slate-800"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur text-slate-400 text-xs px-3 py-1 rounded-full pointer-events-none">
          Draw your architecture here
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-4 bg-slate-900 border-t border-slate-700 flex justify-end">
        <button
          onClick={handleExport}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20"
        >
          Refine Sketch with AI
        </button>
      </div>
    </div>
  );
};

export default DrawingCanvas;
