import { paintBoard } from '../paintBoard'
import { fabric } from 'fabric'
import useBoardStore from '@/store/board'

export const updateCanvasBackgroundImage = (data: string) => {
  const canvas = paintBoard.canvas
  if (!canvas) {
    return
  }
  fabric.Image.fromURL(
    data,
    (image: fabric.Image) => {
      updateCanvasBackgroundImageRect(image)

      canvas.setBackgroundImage(image, () => {
        paintBoard.render()
      })
    },
    {
      crossOrigin: 'anonymous'
    }
  )
}

export const updateCanvasBackgroundImageRect = (image: fabric.Image) => {
  const canvas = paintBoard?.canvas
  if (!canvas) {
    return
  }

  const canvasWidth = canvas.getWidth()
  const canvasHeight = canvas.getHeight()

  const imgWidth = image.width as number
  const imgHeight = image.height as number

  // 计算最大正方形的边长
  const size = Math.min(imgWidth, imgHeight)

  // 计算裁剪的起始位置，使其居中
  const cropX = (imgWidth - size) / 2
  const cropY = (imgHeight - size) / 2

  // 设置裁剪区域
  image.set({
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

export const handleBackgroundImage = (url: string) => {
  if (!paintBoard.canvas) return

  fabric.Image.fromURL(url, (img: fabric.Image) => {
    const canvas = paintBoard.canvas
    if (!canvas) return

    const imgWidth = img.width as number
    const imgHeight = img.height as number

    // 计算最大正方形的边长
    const size = Math.min(imgWidth, imgHeight)

    // 计算裁剪的起始位置，使其居中
    const cropX = (imgWidth - size) / 2
    const cropY = (imgHeight - size) / 2

    // 创建一个新的裁剪后的图像
    const croppedCanvas = document.createElement('canvas')
    croppedCanvas.width = size
    croppedCanvas.height = size
    const ctx = croppedCanvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(
        img.getElement(),
        cropX,
        cropY,
        size,
        size,
        0,
        0,
        size,
        size
      )
    }

    fabric.Image.fromURL(
      croppedCanvas.toDataURL(),
      (croppedImg: fabric.Image) => {
        const canvasWidth = canvas.getWidth()
        const canvasHeight = canvas.getHeight()

        // 设置缩放
        croppedImg.set({
          scaleX: canvasWidth / size,
          scaleY: canvasHeight / size,
          left: 0,
          top: 0,
          originX: 'left',
          originY: 'top',
          opacity: useBoardStore.getState().backgroundImageOpacity
        })

        canvas.setBackgroundImage(
          croppedImg,
          () => {
            canvas.renderAll()
            // 保存状态到历史记录
            paintBoard.history?.saveState()
          },
          {
            crossOrigin: 'anonymous'
          }
        )
      }
    )
  })
}
