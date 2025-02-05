import React, { useEffect, useRef, useState } from 'react'
import { paintBoard } from '@/utils/paintBoard'

import SimpleToolPanel from '@/components/simpleToolPanel'
import CleanModal from '@/components/cleanModal'
import BoardOperation from '@/components/boardOperation'
import DeleteFileModal from '@/components/boardOperation/deleteFileModal'
import useBoardStore from '@/store/board'

const Board: React.FC = () => {
  const canvasEl = useRef<HTMLCanvasElement>(null)
  const [canvasLoaded, setCanvasLoaded] = useState(false)
  const { updateBackgroundImage } = useBoardStore()

  const updateCanvasSize = () => {
    if (canvasEl.current && paintBoard.canvas) {
      const size = Math.min(window.innerWidth, window.innerHeight, 512) - 20

      // 设置DOM canvas的尺寸
      canvasEl.current.width = size
      canvasEl.current.height = size
      canvasEl.current.style.width = `${size}px`
      canvasEl.current.style.height = `${size}px`

      // 设置fabric canvas的尺寸
      paintBoard.canvas.setWidth(size)
      paintBoard.canvas.setHeight(size)
      paintBoard.canvas.renderAll()
    }
  }

  useEffect(() => {
    if (canvasEl.current) {
      const size = Math.min(window.innerWidth, window.innerHeight, 512) - 20

      // 设置canvas的实际尺寸
      canvasEl.current.width = size
      canvasEl.current.height = size

      // 设置显示尺寸
      canvasEl.current.style.width = `${size}px`
      canvasEl.current.style.height = `${size}px`

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
    window.addEventListener('resize', updateCanvasSize)
    return () => {
      window.removeEventListener('resize', updateCanvasSize)
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
        paintBoard.canvas.clear()
        paintBoard.canvas.renderAll()
        paintBoard.history?.clean()
        console.log(paintBoard.history?.index)
      }
    }

    return () => {
      // 清理全局方法
      window.receiveImage = () => {}
      window.clearCanvasConfirm = () => {}
    }
  }, [updateBackgroundImage])


  return (
    <div>
      <div className="w-screen h-screen flex justify-center items-center bg-[#303030]">
        <canvas className="block" ref={canvasEl}></canvas>
      </div>
      {canvasLoaded && (
        <>
          <SimpleToolPanel />
          {/* <GuideInfo /> */}
          <CleanModal />
          <DeleteFileModal />
          <BoardOperation />
        </>
      )}
    </div>
  )
}

export default Board
