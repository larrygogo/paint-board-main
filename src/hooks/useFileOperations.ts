import { useState } from 'react'
import useFileStore from '@/store/files'
import useBoardStore from '@/store/board'
import { ActionMode } from '@/constants'
import { paintBoard } from '@/utils/paintBoard'

const useFileOperations = () => {
  const [showUploadFail, setShowUploadFail] = useState(false)
  const { updateMode } = useBoardStore()
  const {
    files,
    currentId,
    updateCurrentFile,
    updateTitle,
    addFile,
    saveJSON,
    uploadFile
  } = useFileStore()

  const updateCurrentFileId = (id: string) => {
    updateCurrentFile(id)
    paintBoard.initCanvasStorage()
    updateMode(ActionMode.DRAW)
  }

  const handleUploadFile = async (file?: File) => {
    const success = await uploadFile(file)
    if (success) {
      paintBoard.initCanvasStorage()
      updateMode(ActionMode.DRAW)
    } else {
      setShowUploadFail(true)
      setTimeout(() => setShowUploadFail(false), 1500)
    }
  }

  return {
    files,
    currentId,
    showUploadFail,
    updateCurrentFileId,
    updateTitle,
    addFile,
    saveJSON,
    handleUploadFile
  }
}

export default useFileOperations
