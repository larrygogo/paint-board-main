import { fabric } from 'fabric'
import { paintBoard } from '@/utils/paintBoard'
import { setObjectAttr } from '@/utils/common/draw'
import { getShapeBorderWidth } from './utils'
import useShapeStore from '@/store/shape'
import { ELEMENT_CUSTOM_TYPE } from '@/constants'

export class CircleShape {
  shapeInstance: fabric.Circle | undefined
  startX = 0
  startY = 0

  constructor(point: fabric.Point | undefined) {
    if (!point) {
      return
    }

    const strokeWidth = getShapeBorderWidth()
    const shape = new fabric.Circle({
      left: point.x,
      top: point.y,
      radius: 0,
      stroke: useShapeStore.getState().borderColor,
      strokeWidth,
      strokeUniform: true,
      strokeLineCap: 'round',
      perPixelTargetFind: true,
      fill: 'transparent'
    })

    paintBoard.canvas?.add(shape)
    this.shapeInstance = shape
    this.startX = point.x
    this.startY = point.y
    setObjectAttr(shape, ELEMENT_CUSTOM_TYPE.SHAPE_CIRCLE)
  }

  addPosition(point: fabric.Point | undefined) {
    if (!point || !this.shapeInstance) {
      return
    }
    const { x: moveToX, y: moveToY } = new fabric.Point(point.x, point.y)
    const width = Math.abs(moveToX - this.startX)
    const height = Math.abs(moveToY - this.startY)
    const radius = Math.min(width, height) / 2
    const left = moveToX > this.startX ? this.startX : this.startX - radius * 2
    const top = moveToY > this.startY ? this.startY : this.startY - radius * 2

    this.shapeInstance.set({
      radius,
      left,
      top
    })

    this.shapeInstance.setCoords()
    paintBoard.canvas?.requestRenderAll()
  }

  destroy() {
    if (this.shapeInstance) {
      paintBoard.canvas?.remove(this.shapeInstance)
    }
  }
}
