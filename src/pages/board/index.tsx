import React, { useEffect, useRef, useState } from 'react'
import { paintBoard } from '@/utils/paintBoard'

import ToolPanel from '@/components/toolPanel'
import BoardOperation from '@/components/boardOperation'
import useBoardStore from '@/store/board'

const Board: React.FC = () => {
  const canvasEl = useRef<HTMLCanvasElement>(null)
  const [canvasLoaded, setCanvasLoaded] = useState(false)
  const { updateBackgroundImage } = useBoardStore()

  useEffect(() => {
    if (canvasEl.current) {
      paintBoard
        .initCanvas(canvasEl.current as HTMLCanvasElement)
        .then((loaded) => {
          setCanvasLoaded(loaded)
        })
    }
    return () => {
      paintBoard.removeCanvas()
    }
  }, [])

  useEffect(() => {
    // 实现接收图片的全局方法
    window.receiveImage = (imageUrl: string) => {
      const img = new window.Image() as HTMLImageElement
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // 假设画板的宽高可以通过某种方式获取，例如通过 ref 或者全局变量
        const boardWidth = paintBoard.canvas?.getWidth() || 1
        const boardHeight = paintBoard.canvas?.getHeight() || 1
        const boardMinSide = Math.min(boardWidth, boardHeight)

        const scale = boardMinSide / Math.min(img.width, img.height)
        const newWidth = img.width * scale
        const newHeight = img.height * scale

        canvas.width = newWidth
        canvas.height = newHeight

        ctx.drawImage(img, 0, 0, newWidth, newHeight)

        const croppedData = canvas.toDataURL()
        updateBackgroundImage(croppedData)
      }
      img.src = imageUrl
    }

    // 实现清空画布的全局方法
    window.clearCanvasConfirm = () => {
      if (paintBoard.canvas) {
        const objects = paintBoard.canvas?.getObjects()
        objects?.forEach((obj) => {
          paintBoard.canvas?.remove(obj)
        })

        paintBoard.history?.clean()
        paintBoard.history?.initHistory()
      }
    }

    return () => {
      // 清理全局方法
      window.receiveImage = undefined
      window.clearCanvasConfirm = undefined
    }
  }, [updateBackgroundImage])

  return (
    <div className="fixed inset-0">
      <div className="relative w-full h-full flex items-center justify-center">
        <canvas className="block touch-none" ref={canvasEl}></canvas>
        {canvasLoaded && (
          <>
            <ToolPanel />
            <BoardOperation />
          </>
        )}
      </div>
    </div>
  )
}

export default Board
