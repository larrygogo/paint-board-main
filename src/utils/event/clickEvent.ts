import { fabric } from 'fabric'
import { ActionMode } from '@/constants'
import { DrawStyle, DrawType } from '@/constants/draw'
import { ShapeStyle } from '@/constants/shape'
import { paintBoard } from '../paintBoard'

import { ReticulateElement } from '../element/draw/reticulate'
import { ShapeElement } from '../element/draw/shape'
import { PixelsElement } from '../element/draw/pixels'
import { DrawTextElement } from '../element/draw/text'
import { MultiLineElement } from '../element/draw/multiLine'
import { RainbowElement } from '../element/draw/rainbow'
import { ThornElement } from '../element/draw/thorn'
import { MultiPointElement } from '../element/draw/multiPoint'
import { WiggleElement } from '../element/draw/wiggle'

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
  isSpaceKeyDown = false
  startPoint: fabric.Point | undefined
  currentElement:
    | ShapeElement
    | PixelsElement
    | DrawTextElement
    | MultiLineElement
    | ReticulateElement
    | RainbowElement
    | ThornElement
    | MultiPointElement
    | WiggleElement
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
      if (this.isSpaceKeyDown) {
        return
      }
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
            case DrawStyle.Shape:
              currentElement = new ShapeElement()
              break
            case DrawStyle.Pixels:
              currentElement = new PixelsElement()
              break
            case DrawStyle.Text:
              currentElement = new DrawTextElement()
              break
            case DrawStyle.MultiLine:
              currentElement = new MultiLineElement()
              break
            case DrawStyle.Reticulate:
              currentElement = new ReticulateElement()
              break
            case DrawStyle.Rainbow:
              currentElement = new RainbowElement()
              break
            case DrawStyle.Thorn:
              currentElement = new ThornElement()
              break
            case DrawStyle.MultiPoint:
              currentElement = new MultiPointElement()
              break
            case DrawStyle.Wiggle:
              currentElement = new WiggleElement()
              break
            default:
              break
          }
        }
      }
      this.currentElement = currentElement
    })
    canvas?.on('mouse:move', (e) => {
      if (this.isMouseDown) {
        // Press space, drag the canvas, stop drawing.
        if (this.isSpaceKeyDown) {
          canvas.relativePan(new fabric.Point(e.e.movementX, e.e.movementY))
          return
        }

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

    canvas?.on('mouse:dblclick', (e) => {
      if (e?.absolutePointer) {
        const { x, y } = e.absolutePointer
        paintBoard.textElement?.loadText(x, y)
      }
    })
  }

  setSpaceKeyDownState(isSpaceKeyDown: boolean) {
    this.isSpaceKeyDown = isSpaceKeyDown
  }
}
