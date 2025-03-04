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
      // const img = new Image()
      // img.src = imageUrl
      // img.onload = () => {
      //   if (canvasEl.current) {
      //     const canvas = canvasEl.current
      //     const context = canvas.getContext('2d')
      //     if (context) {
      //       // 清空画布
      //       context.clearRect(0, 0, canvas.width, canvas.height)
      //       // 绘制图片并调整大小
      //       context.drawImage(img, 0, 0, canvas.width, canvas.height)
      //     }
      //   }
      // }

      // 创建canvas
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      console.log(context)
      if (context) {
        // 从base64获取图片
        const img = new Image()
        img.src = imageUrl
        img.onload = () => {
          context.drawImage(img, 0, 0, canvas.width, canvas.height)
          const base64 = canvas.toDataURL('image/png')
          updateBackgroundImage(base64)
        }
      }
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
