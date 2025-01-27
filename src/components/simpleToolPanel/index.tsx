import { useState, FC } from 'react'
import { useTranslation } from 'react-i18next'
import useBoardStore from '@/store/board'
import { ActionMode } from '@/constants'
import { modeSwitch, ShapeStyle } from './constant'

import DrawConfig from './drawConfig'
import EraserConfig from './eraserConfig'
import SelectConfig from './selectConfig'
import BoardConfig from './boardConfig'
import CloseIcon from '@/components/icons/close.svg?react'
import MenuIcon from '@/components/icons/menu.svg?react'
import { DrawType } from '@/constants/draw'
import { DrawStyle } from '@/constants/draw'
import useShapeStore from '@/store/shape'
import useDrawStore from '@/store/draw'

const ToolPanel: FC = () => {
  const { t } = useTranslation()
  const { mode, updateMode } = useBoardStore()
  const { drawType, updateDrawType } = useBoardStore()
  const { drawStyle, updateDrawStyle } = useDrawStore()
  const { shapeStyle, updateShapeStyle } = useShapeStore()
  const [showPanel, setShowPanel] = useState(true) // toggle main panel display

  return (
    <div
      className={`fixed bottom-7 left-7 flex card shadow-xl overflow-visible z-3 bg-[#eef1ff] max-h-[80%] max-w-[85%] ${showPanel ? 'p-5' : ''
        }`}
    >
      <button
        className={`btn btn-xs flex-grow font-fredokaOne font-normal ${drawStyle === DrawStyle.Basic ? 'btn-active font-semibold' : ''
          }`}
        onClick={() => {
          updateMode(ActionMode.DRAW)
          updateDrawType(DrawType.FreeStyle)
          updateDrawStyle(DrawStyle.Basic)
        }}
      >
        画笔
      </button>
      <button
        className={`btn btn-xs flex-grow font-fredokaOne font-normal ${drawStyle === ShapeStyle.Rect ? 'btn-active font-semibold' : ''
          }`}
        onClick={() => {
          updateMode(ActionMode.DRAW)
          updateDrawType(DrawType.Shape)
          updateShapeStyle(ShapeStyle.Rect)
        }}
      >
        矩形
      </button>
      <button
        className={`btn btn-xs flex-grow font-fredokaOne font-normal ${drawStyle === ShapeStyle.Triangle ? 'btn-active font-semibold' : ''
          }`}
        onClick={() => {
          updateMode(ActionMode.DRAW)
          updateDrawType(DrawType.Shape)
          updateShapeStyle(ShapeStyle.Triangle)
        }}
      >
        三角形
      </button>
      <button
        className={`btn btn-xs flex-grow font-fredokaOne font-normal ${drawStyle === ShapeStyle.Ellipse ? 'btn-active font-semibold' : ''
          }`}
        onClick={() => {
          updateMode(ActionMode.DRAW)
          updateDrawType(DrawType.Shape)
          updateShapeStyle(ShapeStyle.Ellipse)
        }}
      >
        圆形
      </button>
    </div>
  )
}

export default ToolPanel
