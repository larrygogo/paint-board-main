import { ActionMode } from '@/constants'
import { DrawType } from '@/constants/draw'
import { DrawStyle } from '@/constants/draw'

export const modeSwitch = [
  {
    type: ActionMode.DRAW,
    text: 'tool.draw'
  },
  {
    type: ActionMode.ERASE,
    text: 'tool.eraser'
  },
  {
    type: ActionMode.SELECT,
    text: 'tool.select'
  },
]

export const DrawTypeSwitch = [
  {
    type: DrawType.FreeStyle,
    text: 'drawType.freeStyle'
  },
  {
    type: DrawType.Shape,
    text: 'drawType.shape'
  }
]

export enum ShapeStyle {
  Rect = 'rect',
  Triangle = 'triangle',
  Ellipse = 'ellipse',
  Line = 'line'
}
