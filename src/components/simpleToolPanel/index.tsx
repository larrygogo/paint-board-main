import { FC, useState, useEffect, useRef, ChangeEvent } from 'react'
import useBoardStore from '@/store/board'
import { ActionMode } from '@/constants'
import { ShapeStyle } from './constant'
import {
  Pencil,
  Square,
  Triangle,
  Circle,
  Eraser,
  MousePointer,
  Shapes,
  Minus,
  Type,
  Image,
  Palette,
  RefreshCw,
  ArrowLeftRight
} from 'lucide-react'

import { DrawType } from '@/constants/draw'
import { DrawStyle } from '@/constants/draw'
import useShapeStore from '@/store/shape'
import useDrawStore from '@/store/draw'
import { paintBoard } from '@/utils/paintBoard'
import ColorPicker from '../colorPicker'

const ToolPanel: FC = () => {
  const { mode, updateMode } = useBoardStore()
  const { drawType, updateDrawType, updateBackgroundImage } = useBoardStore()
  const { drawStyle, updateDrawStyle, updateDrawWidth, updateEraserWidth, updateDrawColors } = useDrawStore()
  const { shapeStyle, updateShapeStyle, updateBorderWidth, updateBorderColor, borderColor } = useShapeStore()
  const [showShapePopover, setShowShapePopover] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [showEraserConfig, setShowEraserConfig] = useState(false)
  const eraserRef = useRef<HTMLDivElement>(null)
  const [showColorPicker, setShowColorPicker] = useState(false)

  // 处理点击外部关闭 popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowShapePopover(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 监听工具切换，关闭 popover
  useEffect(() => {
    if (mode !== ActionMode.DRAW || drawType !== DrawType.Shape) {
      setShowShapePopover(false)
    }
  }, [mode, drawType])

  // 处理点击外部关闭 eraser config
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (eraserRef.current && !eraserRef.current.contains(event.target as Node)) {
        setShowEraserConfig(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 监听工具切换，关闭 eraser config
  useEffect(() => {
    if (mode !== ActionMode.ERASE) {
      setShowEraserConfig(false)
    }
  }, [mode])

  // 添加 ESC 键监听
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowColorPicker(false)
      }
    }

    document.addEventListener('keydown', handleEscKey)
    return () => {
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [])

  const shapeButtons = [
    {
      icon: <Square size={16} />,
      style: ShapeStyle.Rect,
      isActive: mode === ActionMode.DRAW && drawType === DrawType.Shape && shapeStyle === ShapeStyle.Rect
    },
    {
      icon: <Triangle size={16} />,
      style: ShapeStyle.Triangle,
      isActive: mode === ActionMode.DRAW && drawType === DrawType.Shape && shapeStyle === ShapeStyle.Triangle
    },
    {
      icon: <Circle size={16} />,
      style: ShapeStyle.Ellipse,
      isActive: mode === ActionMode.DRAW && drawType === DrawType.Shape && shapeStyle === ShapeStyle.Ellipse
    },
    {
      icon: <Minus size={16} />,
      style: ShapeStyle.Line,
      isActive: mode === ActionMode.DRAW && drawType === DrawType.Shape && shapeStyle === ShapeStyle.Line
    },
  ]

  const handleShapeSelect = (style: string) => {
    updateMode(ActionMode.DRAW)
    updateDrawType(DrawType.Shape)
    updateShapeStyle(style)
    updateBorderWidth(3)
    setShowShapePopover(false)
  }

  const inputText = () => {
    paintBoard.textElement?.loadText()
  }

  const handleEraserWidthChange = (width: number) => {
    updateEraserWidth(width)
  }

  // 添加处理背景图片上传的函数
  const handleBackgroundImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = (fEvent) => {
      const data = fEvent.target?.result
      if (data && typeof data === 'string') {
        updateBackgroundImage(data)
      }
      e.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  // 获取当前激活的形状图标
  const getShapeIcon = () => {
    if (mode === ActionMode.DRAW && drawType === DrawType.Shape) {
      const activeShape = shapeButtons.find(shape => shape.style === shapeStyle)
      return activeShape?.icon || <Shapes size={16} />
    }
    return <Shapes size={16} />
  }

  const handleColorSelect = (color: string) => {
    updateDrawColors([color])
    updateBorderColor(color)

    // 这里可以添加更新画笔颜色的逻辑
  }

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex gap-1 bg-white rounded-lg shadow-xl p-1">
        <button
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 ${mode === ActionMode.SELECT
              ? 'bg-green-500 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
            }`}
          onClick={() => updateMode(ActionMode.SELECT)}
        >
          <MousePointer size={16} />
        </button>

        <button
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 ${mode === ActionMode.DRAW &&
              drawType === DrawType.FreeStyle &&
              drawStyle === DrawStyle.Basic
              ? 'bg-green-500 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
            }`}
          onClick={() => {
            updateMode(ActionMode.DRAW)
            updateDrawType(DrawType.FreeStyle)
            updateDrawStyle(DrawStyle.Basic)
            updateDrawWidth(5)
          }}
        >
          <Pencil size={16} />
        </button>

        <div className="relative" ref={popoverRef}>
          <button
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 ${mode === ActionMode.DRAW && drawType === DrawType.Shape
                ? 'bg-green-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
              }`}
            onClick={() => setShowShapePopover(!showShapePopover)}
          >
            {getShapeIcon()}
          </button>

          {showShapePopover && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl p-1 flex gap-2">
              {shapeButtons.map((shape, index) => (
                <button
                  key={index}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 ${shape.isActive
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  onClick={() => handleShapeSelect(shape.style)}
                >
                  {shape.icon}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 ${mode === ActionMode.TEXT
              ? 'bg-green-500 text-white shadow-lg'
              : 'text-gray-600 hover:bg-gray-100'
            }`}
          onClick={inputText}
        >
          <Type size={16} />
        </button>

        <label
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 text-gray-600 hover:bg-gray-100 cursor-pointer`}
        >
          <Image size={16} />
          <input
            type="file"
            accept=".jpeg, .jpg, .png"
            className="hidden"
            onChange={handleBackgroundImage}
          />
        </label>

        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 text-gray-600 hover:bg-gray-100"
          onClick={() => setShowColorPicker(true)}
          style={{ 
            color: borderColor,
            backgroundColor: borderColor === '#ffffff' ? '#777777' : "",
          }}
        >
          <Palette size={16} />
        </button>

        <div className="relative" ref={eraserRef}>
          <button
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 ${mode === ActionMode.ERASE
                ? 'bg-green-500 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
              }`}
            onClick={() => {
              updateMode(ActionMode.ERASE)
              updateEraserWidth(20)
              setShowEraserConfig(true)
            }}
          >
            <Eraser size={16} />
          </button>

          {showEraserConfig && (
            <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-xl p-2 flex items-center gap-2 min-w-[160px]">
              <span className="text-xs text-gray-500">10</span>
              <input
                type="range"
                min="10"
                max="30"
                step="5"
                defaultValue="20"
                className="flex-1"
                onChange={(e) => handleEraserWidthChange(Number(e.target.value))}
              />
              <span className="text-xs text-gray-500">30</span>
            </div>
          )}
        </div>

        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 text-gray-600 hover:bg-gray-100"
          onClick={() => {
            // 发送消息给原生应用
            if (window.webkit?.messageHandlers?.requestTransform) {
              window.webkit.messageHandlers.requestTransform.postMessage("transform")
            }
          }}
        >
          <ArrowLeftRight size={16} />
        </button>
      </div>

      {showColorPicker && (
        <ColorPicker
          visible={true}
          onClose={() => setShowColorPicker(false)}
          onSelect={handleColorSelect}
          currentColor={borderColor}
        />
      )}
    </>
  )
}

export default ToolPanel
