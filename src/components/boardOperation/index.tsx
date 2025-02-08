import { useState } from 'react'
import useBoardStore from '@/store/board'
import { useTranslation } from 'react-i18next'
import { ActionMode } from '@/constants'
import { paintBoard } from '@/utils/paintBoard'
import { Undo2, Redo2, Trash2, Delete, Share2 } from 'lucide-react'

import FileList from './fileList'

const BoardOperation = () => {
  const { t } = useTranslation()
  const { mode } = useBoardStore()
  const [showFile, updateShowFile] = useState(false)
  // delete activity object
  const deleteObject = () => {
    paintBoard.deleteObject()
  }

  // click undo
  const undo = () => {
    paintBoard.history?.undo()
  }

  // click redo
  const redo = () => {
    paintBoard.history?.redo()
  }

  // 生成画布的 base64 数据
  const handleShare = () => {
    if (paintBoard.canvas) {
      try {
        const url = paintBoard.executeWithoutListeners(() => {
          const dataUrl = paintBoard.canvas?.toDataURL()
          return dataUrl || ''
        })
        if (url && window.webkit?.messageHandlers.messageHandler) {
          window.webkit.messageHandlers.messageHandler.postMessage(url)
        }
      } catch (error) {
        console.error('Failed to generate canvas data URL:', error)
      }
    }
  }

  return (
    <>
      <div className="fixed top-6 left-1/2 -translate-x-1/2 flex gap-1 bg-white rounded-lg shadow-xl p-1">
        <button
          onClick={undo}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 text-gray-600 hover:bg-gray-100"
          title={t('operate.undo').toString()}
        >
          <Undo2 size={16} />
        </button>
        <button
          onClick={redo}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 text-gray-600 hover:bg-gray-100"
          title={t('operate.redo').toString()}
        >
          <Redo2 size={16} />
        </button>

        {[ActionMode.SELECT, ActionMode.Board].includes(mode) && (
          <button
            onClick={deleteObject}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 text-gray-600 hover:bg-gray-100"
            title={t('operate.delete').toString()}
          >
            <Delete size={16} />
          </button>
        )}

        <div className="w-px h-4 my-2 bg-gray-200"></div>

        <button
          onClick={() => {
            if (window.webkit?.messageHandlers.clearCanvas) {
              window.webkit.messageHandlers.clearCanvas.postMessage(
                'clearCanvas'
              )
            }
          }}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 text-gray-600 hover:bg-gray-100 cursor-pointer"
          title={t('operate.clean').toString()}
        >
          <Trash2 size={16} />
        </button>

        <div className="w-px h-4 my-2 bg-gray-200"></div>

        <button
          onClick={handleShare}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 text-gray-600 hover:bg-gray-100"
          title={t('operate.share').toString()}
        >
          <Share2 size={16} />
        </button>
      </div>

      {showFile && <FileList updateShow={updateShowFile} />}
    </>
  )
}

export default BoardOperation
