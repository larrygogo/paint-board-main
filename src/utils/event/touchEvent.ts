import { paintBoard } from '../paintBoard'
import { fabric } from 'fabric'
import { debounce } from 'lodash'
import { brushMouseMixin } from '../common/fabricMixin/brushMouse'
import useFileStore from '@/store/files'
import useBoardStore from '@/store/board'

export class CanvasTouchEvent {
  isTwoTouch = false
  isDragging = false
  startDistance = 1 // record the starting two-finger distance
  startX = 0 // start center X
  startY = 0 // start center Y
  startScale = 1
  lastPan?: fabric.Point

  constructor() {
    this.initTouchEvent()
  }

  initTouchEvent() {
    const canvas = paintBoard?.canvas?.upperCanvasEl
    if (canvas) {
      canvas.addEventListener('touchstart', this.touchStartFn, {
        passive: false
      })
      canvas.addEventListener('touchmove', this.touchMoveFn, { passive: false })
      canvas.addEventListener('touchend', this.touchEndFn, { passive: false })
    }
  }

  removeTouchEvent() {
    const canvas = paintBoard?.canvas?.upperCanvasEl
    if (canvas) {
      canvas.removeEventListener('touchstart', this.touchStartFn)
      canvas.removeEventListener('touchmove', this.touchMoveFn)
      canvas.removeEventListener('touchend', this.touchEndFn)
    }
  }

  touchStartFn = (e: TouchEvent) => {
    e.preventDefault()
    const canvas = paintBoard.canvas
    if (!canvas) {
      return
    }
    const touches = e.touches

    brushMouseMixin.updateIsDisableDraw(touches.length >= 2)

    if (touches.length === 2) {
      this.isTwoTouch = true
      const touch1 = touches[0]
      const touch2 = touches[1]
      this.startDistance = Math.hypot(
        touch2.pageX - touch1.pageX,
        touch2.pageY - touch1.pageY
      )

      this.startX = (touch1.pageX + touch2.pageX) / 2
      this.startY = (touch1.pageY + touch2.pageY) / 2
      this.startScale = canvas.getZoom()
    }
  }

  touchMoveFn = (e: TouchEvent) => {
    e.preventDefault()
    const canvas = paintBoard.canvas
    if (!canvas) {
      return
    }
  }

  touchEndFn = (e: TouchEvent) => {
    this.isDragging = false
    if (this.isTwoTouch && e.touches.length === 0) {
      this.isTwoTouch = false
    }
  }

  saveTransform = debounce(() => {
    const transform = paintBoard.canvas?.viewportTransform
    if (transform) {
      useFileStore.getState().updateTransform(transform)
      if (!useBoardStore.getState().isObjectCaching) {
        fabric.Object.prototype.set({
          objectCaching: false
        })
      }
      paintBoard.canvas?.requestRenderAll()
    }
  }, 500)
}
