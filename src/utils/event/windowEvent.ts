import { paintBoard } from '../paintBoard'
import { ImageElement } from '../element/image'
import useBoardStore from '@/store/board'

export class WindowEvent {
  constructor() {
    this.initWindowEvent()
  }

  initWindowEvent() {
    window.addEventListener('paste', this.pasteFn)
    window.addEventListener('resize', this.resizeFn)
    window.addEventListener('orientationchange', this.resizeFn)
  }

  removeWindowEvent() {
    window.removeEventListener('paste', this.pasteFn)
    window.removeEventListener('resize', this.resizeFn)
    window.removeEventListener('orientationchange', this.resizeFn)
  }

  pasteFn(e: ClipboardEvent) {
    if (e.clipboardData && e.clipboardData.items) {
      /**
       * Paste Clipboard Image
       */
      const items = e.clipboardData.items
      const item = Array.from(items).find(
        (item) => item.kind === 'file' && item.type.indexOf('image') !== -1
      )
      if (item) {
        const blob = item.getAsFile()
        if (blob) {
          const reader = new FileReader()
          reader.onload = (event) => {
            const data = event.target?.result
            if (data && typeof data === 'string') {
              const image = new ImageElement()
              image.addImage(data)
            }
          }

          reader.readAsDataURL(blob)
        }
      }
    }
  }

  resizeFn() {
    const canvas = paintBoard.canvas
    if (canvas) {
      // 修改画布大小，使其最大640px且不超过当前屏幕宽度的90%
      const maxWidth = Math.min(window.innerWidth * 0.9, 640)
      canvas.setWidth(maxWidth)
      canvas.setHeight(maxWidth)

      // 如果有背景图，则修改背景图大小，使其铺满画布
      if (useBoardStore.getState().hasBackgroundImage) {
        const backgroundImage = paintBoard.canvas
          ?.backgroundImage as fabric.Image
        backgroundImage.scaleToWidth(maxWidth, true)
        backgroundImage.scaleToHeight(maxWidth, true)
      }
    }
  }
}
