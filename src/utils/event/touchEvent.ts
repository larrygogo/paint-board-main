import { paintBoard } from '../paintBoard'
import { fabric } from 'fabric'
import { debounce } from 'lodash'
import { brushMouseMixin } from '../common/fabricMixin/brushMouse'
import useFileStore from '@/store/files'
import useBoardStore from '@/store/board'
import { MAX_ZOOM, MIN_ZOOM } from './zoomEvent'

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
      const touch1 = touches[0]
      const touch2 = touches[1]

      const currentDistance = Math.hypot(
        touch2.pageX - touch1.pageX,
        touch2.pageY - touch1.pageY
      )

      const x = (touch1.pageX + touch2.pageX) / 2
      const y = (touch1.pageY + touch2.pageY) / 2

      // Calculate zoom
      let zoom = this.startScale * (currentDistance / this.startDistance)
      zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom))
      if (!useBoardStore.getState().isObjectCaching) {
        fabric.Object.prototype.set({
          objectCaching: true
        })
      }

      // Calculate drag distance
      const currentPan = new fabric.Point(x - this.startX, y - this.startY)

      // 计算缩放中心点
      const zoomCenter = new fabric.Point(this.startX, this.startY)

      // 使用画布的中心点进行缩放
      canvas.zoomToPoint(zoomCenter, zoom)
      paintBoard.event?.zoomEvent.updateZoomPercentage(true, zoom)

      // 获取背景图对象
      const backgroundImage = canvas.backgroundImage as fabric.Image
      if (backgroundImage && backgroundImage.width && backgroundImage.height) {
        // 应用缩放比例
        backgroundImage.scale(zoom)

        // 更新背景图的尺寸
        backgroundImage.setCoords()

        // 计算背景图的边界
        const bounds = {
          left: 0,
          top: 0,
          right: canvas.getWidth() - backgroundImage.getScaledWidth(),
          bottom: canvas.getHeight() - backgroundImage.getScaledHeight()
        }

        // 检查并调整移动量以保持在边界内
        const newPanX = Math.min(
          Math.max(currentPan.x, bounds.left),
          bounds.right
        )
        const newPanY = Math.min(
          Math.max(currentPan.y, bounds.top),
          bounds.bottom
        )

        // 移动画布
        if (!this.isDragging) {
          this.isDragging = true
          this.lastPan = new fabric.Point(newPanX, newPanY)
        } else if (this.lastPan) {
          if (!useBoardStore.getState().isObjectCaching) {
            fabric.Object.prototype.set({
              objectCaching: true
            })
          }
          canvas.relativePan(
            new fabric.Point(newPanX - this.lastPan.x, newPanY - this.lastPan.y)
          )
          this.lastPan = new fabric.Point(newPanX, newPanY)
          this.saveTransform()
        }
      }
    }
  }

  touchEndFn = (e: TouchEvent) => {
    this.isDragging = false
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
