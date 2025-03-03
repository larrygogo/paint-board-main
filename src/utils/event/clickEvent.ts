import { fabric } from 'fabric'
import { ActionMode } from '@/constants'
import { DrawType } from '@/constants/draw'
import { ShapeStyle } from '@/constants/shape'
import { paintBoard } from '../paintBoard'

import { RectShape } from '../element/shape/rect'
import { CircleShape } from '../element/shape/circle'
import { LineShape } from '../element/shape/line'
import { EllipseShape } from '../element/shape/ellipse'
import { TriangleShape } from '../element/shape/triangle'

import useDrawStore from '@/store/draw'
import useBoardStore from '@/store/board'
import useShapeStore from '@/store/shape'

export class CanvasClickEvent {
  isMouseDown = false
  startPoint: fabric.Point | undefined
  currentElement:
    | RectShape
    | CircleShape
    | LineShape
    | EllipseShape
    | TriangleShape
    | null = null // The current mouse move draws the element

  constructor() {
    this.initClickEvent()
  }

  initClickEvent() {
    const canvas = paintBoard.canvas

    canvas?.on('mouse:down', (e) => {
      this.isMouseDown = true
      this.startPoint = e.absolutePointer
      let currentElement = null

      if (useBoardStore.getState().mode === ActionMode.DRAW) {
        if (useBoardStore.getState().drawType === DrawType.Shape) {
          switch (useShapeStore.getState().shapeStyle) {
            case ShapeStyle.Rect:
              currentElement = new RectShape(e.absolutePointer)
              break
            case ShapeStyle.Circle:
              currentElement = new CircleShape(e.absolutePointer)
              break
            case ShapeStyle.Line:
              currentElement = new LineShape(e.absolutePointer)
              break
            case ShapeStyle.Ellipse:
              currentElement = new EllipseShape(e.absolutePointer)
              break
            case ShapeStyle.Triangle:
              currentElement = new TriangleShape(e.absolutePointer)
              break
            default:
              break
          }
        } else if (useBoardStore.getState().drawType === DrawType.FreeStyle) {
          switch (useDrawStore.getState().drawStyle) {
            default:
              break
          }
        }
      }
      this.currentElement = currentElement
    })
    canvas?.on('mouse:move', (e) => {
      if (this.isMouseDown) {
        // two touch disabled drawing on mobile
        if (paintBoard.event?.touchEvent.isTwoTouch) {
          return
        }

        if (
          useBoardStore.getState().mode === ActionMode.DRAW &&
          this.currentElement
        ) {
          this.currentElement.addPosition(e.absolutePointer)
        }
      }
    })
    canvas?.on('mouse:up', (e) => {
      this.isMouseDown = false

      if (this.currentElement) {
        let isDestroy = false
        if (this.startPoint && e.absolutePointer) {
          const { x: startX, y: startY } = this.startPoint
          const { x: endX, y: endY } = e.absolutePointer
          if (startX === endX && startY === endY) {
            this.currentElement.destroy()
            isDestroy = true
          }
        }
        if (!isDestroy) {
          if (this.currentElement instanceof LineShape) {
            this.currentElement?.mouseUp()
          }
          paintBoard.history?.saveState()
        }
        this.currentElement = null
      }
    })
  }
}
