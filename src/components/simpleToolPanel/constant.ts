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

export const ShapeStyle = {
  Line: 'line',
  Rect: 'rect',
  Circle: 'cricle',
  Ellipse: 'ellipse',
  Triangle: 'triangle',
  ArrowLine: 'arrowLine',
  ArrowOutline: 'arrowOutline',
  Cloud: 'cloud',
  Tooltips: 'tooltips',
  Lightning: 'lightning',
  Close: 'close',
  Check: 'check',
  Info: 'info',
  Backspace: 'backspace',
  Block: 'block',
  Speaker: 'speaker',
  Search: 'search',
  InfoOutline: 'infoOutline',
  Heart: 'heart',
  Alert: 'alert'
}
