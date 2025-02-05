import { FC } from 'react'

interface ColorPickerProps {
  visible: boolean
  onClose: () => void
  onSelect: (color: string) => void
  currentColor: string
}

const colors = [
  '#ff0000',
  '#ff2000',
  '#ff4000',
  '#ff6000',
  '#ff8000',
  '#ffa000',
  '#ffc000',
  '#ffe000',
  '#ffff00',
  '#e0ff00',
  '#c0ff00',
  '#a0ff00',
  '#80ff00',
  '#60ff00',
  '#40ff00',
  '#20ff00',
  '#00ff00',
  '#00ff24',
  '#00ff49',
  '#00ff6d',
  '#00ff92',
  '#00ffb6',
  '#00ffdb',
  '#00ffff',
  '#00e3ff',
  '#00c6ff',
  '#00aaff',
  '#008eff',
  '#0071ff',
  '#0055ff',
  '#0038ff',
  '#001cff',
  '#0000ff',
  '#2000ff',
  '#4000ff',
  '#6000ff',
  '#8000ff',
  '#a000ff',
  '#c000ff',
  '#e000ff',
  '#ff00ff',
  '#ff20ff',
  '#ff40ff',
  '#ff60ff',
  '#ff80ff',
  '#ffa0ff',
  '#ffc0ff',
  '#ffe0ff',
  '#ffffff',
  '#ffe0e0',
  '#ffc0c0',
  '#ffa0a0',
  '#ff8080',
  '#ff6060',
  '#ff4040',
  '#ff2020',
  '#000000',
  '#202020',
  '#404040',
  '#606060',
  '#808080',
  '#a0a0a0',
  '#c0c0c0',
  '#e0e0e0'
]

const ColorPicker: FC<ColorPickerProps> = ({
  visible,
  onClose,
  onSelect,
  currentColor
}) => {
  if (!visible) return null

  return (
    <>
      {/* 遮罩层 */}
      <div className="fixed inset-0 z-[9999]" onClick={onClose} />

      {/* 颜色选择器 */}
      <div
        className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-white p-3 rounded-xl z-[10000]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-8 gap-2 w-[300px]">
          {colors.map((color) => (
            <button
              key={color}
              className={`w-6 h-6 rounded-lg border ${
                color === currentColor ? 'border-green-500' : 'border-gray-200'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => {
                onSelect(color)
                onClose()
              }}
            />
          ))}
        </div>
      </div>
    </>
  )
}

export default ColorPicker
