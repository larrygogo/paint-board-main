import React, { useEffect, useRef, useState } from 'react'
import { paintBoard } from '@/utils/paintBoard'

import SimpleToolPanel from '@/components/simpleToolPanel'
import BoardOperation from '@/components/boardOperation'
import DeleteFileModal from '@/components/boardOperation/deleteFileModal'
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
      updateBackgroundImage(imageUrl)
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
    <div className="h-screen w-screen flex items-center justify-center">
      <canvas className="block touch-none" ref={canvasEl}></canvas>
      {canvasLoaded && (
        <>
          <SimpleToolPanel />
          <DeleteFileModal />
          <BoardOperation />
        </>
      )}
    </div>
  )
}

export default Board
