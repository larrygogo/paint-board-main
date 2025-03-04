import { paintBoard } from '../paintBoard'
import { fabric } from 'fabric'
import { debounce } from 'lodash'
import { brushMouseMixin } from '../common/fabricMixin/brushMouse'
import useFileStore from '@/store/files'
import useBoardStore from '@/store/board'
import { MAX_ZOOM, MIN_ZOOM } from './zoomEvent'
import { ActionMode } from '@/constants'

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
      // 只在 select 模式下允许缩放
      if (useBoardStore.getState().mode !== ActionMode.SELECT) {
        return
      }

      // 双指操作时禁用对象选择
      canvas.selection = false
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

    const touches = e.touches

    if (touches.length === 2) {
      // 只在 select 模式下允许缩放
      if (useBoardStore.getState().mode !== ActionMode.SELECT) {
        return
      }

      const touch1 = touches[0]
      const touch2 = touches[1]

      const currentDistance = Math.hypot(
        touch2.pageX - touch1.pageX,
        touch2.pageY - touch1.pageY
      )

      // Calculate zoom
      let zoom = this.startScale * (currentDistance / this.startDistance)
      zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom))

      // 计算画布的中心点
      const centerX = canvas.getWidth() / 2
      const centerY = canvas.getHeight() / 2
      const centerPoint = new fabric.Point(centerX, centerY)

      // 使用 zoomToPoint 方法设置缩放中心为画布中心
      canvas.zoomToPoint(centerPoint, zoom)

      // 如果画布有背景图，则缩放背景图
      if (useBoardStore.getState().hasBackgroundImage) {
        const backgroundImage = paintBoard.canvas
          ?.backgroundImage as fabric.Image
        if (backgroundImage) {
          // 调整背景图的缩放
          backgroundImage.scale(zoom)

          // 获取背景图的宽度和高度，提供默认值
          const imageWidth = backgroundImage.width || 0
          const imageHeight = backgroundImage.height || 0

          // 根据画布中心点调整背景图的位置
          backgroundImage.left = centerX - (imageWidth * zoom) / 2
          backgroundImage.top = centerY - (imageHeight * zoom) / 2

          backgroundImage.setCoords()
        }
      }
    }
  }

  touchEndFn = (e: TouchEvent) => {
    if (this.isTwoTouch && e.touches.length === 0) {
      this.isTwoTouch = false
      // 恢复对象选择功能
      if (paintBoard.canvas) {
        paintBoard.canvas.selection = true
      }
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
