import useBoardStore from '@/store/board'
import { paintBoard } from '../paintBoard'
import { fabric } from 'fabric'
import { ActionMode } from '@/constants'
import { DrawStyle } from '@/constants/draw'
import { getDrawWidth, getEraserWidth, getShadowWidth } from '../common/draw'
import useDrawStore from '@/store/draw'
import useFileStore from '@/store/files'
import { debounce } from 'lodash'

let zoomHook: (zoom: number) => undefined
export const MIN_ZOOM = 1
export const MAX_ZOOM = 5

export class CanvasZoomEvent {
  constructor() {
    const canvas = paintBoard.canvas
    if (canvas) {
      canvas.selection = false
      canvas.defaultCursor = 'default'
      canvas.hoverCursor = 'default'
      // 禁用所有平移相关的功能
      canvas.on('mouse:down', () => {
        canvas.defaultCursor = 'default'
      })
      canvas.on('mouse:move', () => {
        canvas.defaultCursor = 'default'
      })
      canvas.on('mouse:up', () => {
        canvas.defaultCursor = 'default'
      })
    }
    this.initZoomEvent()
  }

  initZoomEvent() {
    const canvas = paintBoard.canvas
    if (!canvas) return

    canvas.on('mouse:wheel', (options) => {
      const { e } = options
      // 只在 select 模式下允许缩放
      if (useBoardStore.getState().mode !== ActionMode.SELECT) {
        return
      }

      const delta = options.e.deltaY
      let zoom = canvas.getZoom()
      zoom = delta > 0 ? zoom * 1.1 : zoom / 1.1
      zoom = Math.min(Math.max(MIN_ZOOM, zoom), MAX_ZOOM)

      if (!useBoardStore.getState().isObjectCaching) {
        fabric.Object.prototype.set({
          objectCaching: true
        })
      }

      // 获取鼠标相对于画布的位置
      const pointer = canvas.getPointer(e)
      // 获取当前缩放比例
      const currentZoom = canvas.getZoom()
      // 计算新的缩放比例
      const newZoom = Math.min(Math.max(MIN_ZOOM, zoom), MAX_ZOOM)

      // 计算缩放中心点
      const zoomCenter = new fabric.Point(pointer.x, pointer.y)

      // 使用鼠标位置作为缩放中心点
      canvas.zoomToPoint(zoomCenter, newZoom)

      // 获取背景图对象
      const backgroundImage = canvas.backgroundImage as fabric.Image
      if (backgroundImage && backgroundImage.width && backgroundImage.height) {
        // 应用缩放比例
        backgroundImage.scale(newZoom)
        // 更新背景图的尺寸
        backgroundImage.setCoords()
      }

      options.e.preventDefault()
      options.e.stopPropagation()
      this.updateZoomPercentage(true, newZoom)
    })
  }

  /**
   * Initialize zoom to 1
   */
  initZoom() {
    const canvas = paintBoard.canvas
    if (canvas) {
      const canvasWidth = (canvas?.width || 1) / 2
      const canvasHeight = (canvas?.height || 1) / 2
      canvas.zoomToPoint(new fabric.Point(canvasWidth, canvasHeight), 1)
      this.updateZoomPercentage(true, 1)
    }
  }

  /**
   * Update current zoom percentage
   */
  updateZoomPercentage = debounce((triggerCb = true, zoom: number) => {
    const percentage = this.handleZoomPercentage(triggerCb)
    useFileStore.getState().updateZoom(zoom)
    if (!useBoardStore.getState().isObjectCaching) {
      fabric.Object.prototype.set({
        objectCaching: false
      })
    }
    paintBoard.canvas?.requestRenderAll()
    return percentage
  }, 500)

  handleZoomPercentage(triggerCb = true) {
    const canvas = paintBoard.canvas
    let percentage = 1
    if (canvas) {
      const curZoom = canvas.getZoom()
      percentage = Math.round(
        ((curZoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100
      )
      handleWidth()
    }
    if (triggerCb && zoomHook) {
      zoomHook?.(percentage)
    }
    return percentage
  }

  setZoomHook(hookFn: (zoom: number) => undefined) {
    zoomHook = hookFn
  }
}

/**
 * Change the drawing width after zooming
 */
const handleWidth = () => {
  const brush = paintBoard.canvas?.freeDrawingBrush
  if (!brush) {
    return
  }
  switch (useBoardStore.getState().mode) {
    case ActionMode.ERASE:
      brush.width = getEraserWidth()
      break
    case ActionMode.DRAW:
      if (
        !paintBoard.canvas ||
        ![DrawStyle.Basic].includes(useDrawStore.getState().drawStyle)
      ) {
        return
      }
      brush.width = getDrawWidth()
      if (
        useDrawStore.getState().drawStyle === DrawStyle.Basic &&
        paintBoard.canvas
      ) {
        if (brush.shadow) {
          ;(brush.shadow as fabric.Shadow).blur = getShadowWidth()
        }
      }
      break
    default:
      break
  }
}
