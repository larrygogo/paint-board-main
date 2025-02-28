import { FC } from 'react'

interface ColorPickerProps {
  visible: boolean
  onClose: () => void
  onSelect: (color: string) => void
  currentColor: string
}

const colors = [
  '#FF0000',
  '#FF1000',
  '#FF2000',
  '#FF3000',
  '#FF4000',
  '#FF5000',
  '#FF6000',
  '#FF7000',
  '#FF8000',
  '#FF9000',
  '#FFA000',
  '#FFB000',
  '#FFC000',
  '#FFD000',
  '#FFE000',
  '#FFF000',
  '#FFFF00',
  '#E0FF00',
  '#C0FF00',
  '#A0FF00',
  '#80FF00',
  '#60FF00',
  '#40FF00',
  '#20FF00',
  '#00FF00',
  '#00FF24',
  '#00FF49',
  '#00FF6D',
  '#00FF92',
  '#00FFB6',
  '#00FFDB',
  '#00FFFF',
  '#00E3FF',
  '#00C6FF',
  '#00AAFF',
  '#008EFF',
  '#0071FF',
  '#0055FF',
  '#0038FF',
  '#001CFF',
  '#0000FF',
  '#2000FF',
  '#4000FF',
  '#6000FF',
  '#8000FF',
  '#A000FF',
  '#C000FF',
  '#E000FF',
  '#FF00FF',
  '#FF20FF',
  '#FF40FF',
  '#FF60FF',
  '#FF80FF',
  '#FFA0FF',
  '#FFC0FF',
  '#FFE0FF',
  '#FFFFFF',
  '#FFE0E0',
  '#FFC0C0',
  '#FFA0A0',
  '#FF8080',
  '#FF6060',
  '#FF4040',
  '#FF2020'
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
