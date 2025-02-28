import useFileStore, { IBoardData } from '@/store/files'
import { paintBoard } from './paintBoard'
import { diff, unpatch, patch, Delta } from 'jsondiffpatch'
import { cloneDeep } from 'lodash'
import { getCanvasJSON, handleCanvasJSONLoaded } from './common/loadCanvas'
import useBoardStore from '@/store/board'

const initState = {}

/**
 * Operation History
 */
export class History {
  diffs: Array<Delta> = []
  canvasData: Partial<IBoardData> = {}
  index = 0

  constructor() {
    const canvas = paintBoard.canvas
    if (canvas) {
      const canvasJson = getCanvasJSON()
      this.canvasData = cloneDeep(canvasJson ?? {})
    }
  }

  saveState() {
    const canvas = paintBoard?.canvas
    if (canvas) {
      this.diffs = this.diffs.slice(0, this.index)
      const canvasJson = getCanvasJSON()
      const delta = diff(canvasJson, this.canvasData)
      this.diffs.push(delta)

      // More than 50 operations, remove initial state
      if (this.diffs.length > 50) {
        this.diffs.shift()
      } else {
        this.index++
      }
      this.canvasData = cloneDeep(canvasJson ?? {})
      useFileStore.getState().updateBoardData(canvasJson)
    }
  }

  undo() {
    const canvas = paintBoard?.canvas
    if (canvas && this.index > 0) {
      const delta = this.diffs[this.index - 1]
      this.index--
      const canvasJson = patch(this.canvasData, delta) as IBoardData
      canvas.loadFromJSON(canvasJson, () => {
        handleCanvasJSONLoaded(canvas)
        canvas.requestRenderAll()
        useFileStore.getState().updateBoardData(canvasJson)
        this.canvasData = cloneDeep(canvasJson ?? {})
        paintBoard.triggerHook()
        const backgroundImage = canvas.backgroundImage as fabric.Image
        if (backgroundImage) {
          const imgWidth = backgroundImage.width as number
          const imgHeight = backgroundImage.height as number
          const canvasWidth = canvas.getWidth()
          const canvasHeight = canvas.getHeight()

          const size = Math.min(imgWidth, imgHeight)
          const cropX = (imgWidth - size) / 2
          const cropY = (imgHeight - size) / 2

          backgroundImage.set({
            cropX: cropX,
            cropY: cropY,
            width: size,
            height: size,
            scaleX: canvasWidth / size,
            scaleY: canvasHeight / size,
            left: 0,
            top: 0,
            originX: 'left',
            originY: 'top',
            opacity: useBoardStore.getState().backgroundImageOpacity
          })
        }
      })
    }
  }

  redo() {
    const canvas = paintBoard?.canvas
    if (this.index < this.diffs.length && canvas) {
      const delta = this.diffs[this.index]
      this.index++
      const canvasJson = unpatch(this.canvasData, delta) as IBoardData
      canvas.loadFromJSON(canvasJson, () => {
        handleCanvasJSONLoaded(canvas)
        canvas.requestRenderAll()
        useFileStore.getState().updateBoardData(canvasJson)
        this.canvasData = cloneDeep(canvasJson ?? {})
        paintBoard.triggerHook()
        const backgroundImage = canvas.backgroundImage as fabric.Image
        if (backgroundImage) {
          const imgWidth = backgroundImage.width as number
          const imgHeight = backgroundImage.height as number
          const canvasWidth = canvas.getWidth()
          const canvasHeight = canvas.getHeight()

          const size = Math.min(imgWidth, imgHeight)
          const cropX = (imgWidth - size) / 2
          const cropY = (imgHeight - size) / 2

          backgroundImage.set({
            cropX: cropX,
            cropY: cropY,
            width: size,
            height: size,
            scaleX: canvasWidth / size,
            scaleY: canvasHeight / size,
            left: 0,
            top: 0,
            originX: 'left',
            originY: 'top',
            opacity: useBoardStore.getState().backgroundImageOpacity
          })
        }
      })
    }
  }

  clean() {
    paintBoard?.canvas?.clear()
    useFileStore.getState().updateBoardData(initState)
    useBoardStore.getState().updateBackgroundColor('#ffffff')
    useBoardStore.getState().cleanBackgroundImage()
    this.index = 0
    this.diffs = []
    this.canvasData = {}
  }

  initHistory() {
    const canvas = paintBoard.canvas
    if (canvas) {
      const canvasJson = getCanvasJSON()
      this.canvasData = canvasJson
      this.index = 0
      this.diffs = []
    }
  }
}
