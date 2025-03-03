import { DrawStyle } from '@/constants/draw'
import {
  getDrawWidth,
  getEraserWidth,
  getShadowWidth
} from '@/utils/common/draw'

import { paintBoard } from '@/utils/paintBoard'
import { create } from 'zustand'

interface DrawState {
  drawWidth: number // draw brush width
  drawColors: string[] // draw brush colors
  shadowWidth: number // brush shadow blur
  shadowColor: string // brush shadow color
  drawTextValue: string // text draws the content
  drawStyle: string // draw style
  eraserWidth: number // eraser width
  textFontFamily: string // current text drawing font
}

interface DrawAction {
  updateDrawWidth: (drawWidth: number) => void
  updateDrawColors: (drawColors: string[]) => void
  updateShadowWidth: (shadowWidth: number) => void
  updateShadowColor: (shadowColor: string) => void
  updateDrawStyle: (drawStyle: string) => void
  updateDrawTextValue: (drawTextValue: string) => void
  updateEraserWidth: (eraserWidth: number) => void
  updateTextFontFamily: (fontFamily: string) => void
}

const useDrawStore = create<DrawState & DrawAction>()((set, get) => ({
  drawWidth: 5,
  drawColors: ['#FF0000'],
  shadowWidth: 0,
  shadowColor: '#FF0000',
  drawTextValue: 'draw',
  drawStyle: DrawStyle.Basic,
  eraserWidth: 20,
  textFontFamily: 'Georgia',
  updateDrawWidth(drawWidth) {
    const oldDrawWidth = get().drawWidth
    if (oldDrawWidth !== drawWidth && paintBoard.canvas) {
      paintBoard.canvas.freeDrawingBrush.width = getDrawWidth(drawWidth)
      set({
        drawWidth
      })
    }
  },
  updateDrawColors: (drawColors) => {
    set((state) => {
      switch (state.drawStyle) {
        case DrawStyle.Basic:
          if (paintBoard.canvas) {
            paintBoard.canvas.freeDrawingBrush.color = drawColors[0]
          }
          break
        default:
          break
      }
      return { drawColors }
    })
  },
  updateShadowWidth: (shadowWidth) => {
    set(() => {
      if (paintBoard.canvas) {
        ;(paintBoard.canvas.freeDrawingBrush.shadow as fabric.Shadow).blur =
          getShadowWidth(shadowWidth)
      }
      return { shadowWidth }
    })
  },
  updateShadowColor: (shadowColor) => {
    set(() => {
      if (paintBoard.canvas) {
        ;(paintBoard.canvas.freeDrawingBrush.shadow as fabric.Shadow).color =
          shadowColor
      }
      return { shadowColor }
    })
  },
  updateDrawStyle: (drawStyle) => {
    set({ drawStyle })
    paintBoard.handleDrawStyle()
  },
  updateDrawTextValue: (drawTextValue) => set({ drawTextValue }),
  updateEraserWidth(eraserWidth) {
    set((state) => {
      if (state.drawWidth !== eraserWidth && paintBoard.canvas) {
        paintBoard.canvas.freeDrawingBrush.width = getEraserWidth(eraserWidth)
      }
      return { eraserWidth }
    })
  },
  updateTextFontFamily(fontFamily) {
    set({
      textFontFamily: fontFamily
    })
  }
}))

export default useDrawStore
