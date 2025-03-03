import { fabric } from 'fabric'
import { paintBoard } from '../paintBoard'
import useDrawStore from '@/store/draw'
import { ELEMENT_CUSTOM_TYPE } from '@/constants'

export class TextElement {
  isTextEditing = false
  text: fabric.IText | null = null

  loadText(x?: number, y?: number) {
    if (this.isTextEditing) {
      return
    }
    const canvas = paintBoard.canvas
    if (!canvas) {
      return
    }

    const { drawColors, textFontFamily, drawTextValue } =
      useDrawStore.getState()

    const text = new fabric.IText(drawTextValue, {
      left: x || (canvas.width || 0) / 2,
      top: y || (canvas.height || 0) / 2,
      fontSize: 20,
      fontFamily: textFontFamily,
      fill: drawColors[0],
      fontWeight: 'normal',
      fontStyle: 'normal',
      underline: false,
      linethrough: false,
      _customType: ELEMENT_CUSTOM_TYPE.I_TEXT
    } as fabric.ITextOptions)

    canvas.add(text)
    canvas.setActiveObject(text)
    text.enterEditing()
    text.selectAll()
    this.isTextEditing = true

    text.on('editing:exited', () => {
      this.isTextEditing = false
      paintBoard.history?.saveState()
    })
  }

  resetText() {
    if (this?.text) {
      this.text.exitEditing()
      this.text = null
    }
  }
}
