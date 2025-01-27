import { ChangeEvent, useState } from 'react'
import useBoardStore from '@/store/board'
import { useTranslation } from 'react-i18next'
import { ActionMode } from '@/constants'
import { paintBoard } from '@/utils/paintBoard'
import { 
  Undo2, 
  Redo2, 
  Copy, 
  Trash2, 
  Upload, 
  Trash, 
  Save, 
  Files, 
  Delete
} from 'lucide-react'

import FileList from './fileList'
import DownloadImage from './downloadImage'
import UploadImage from './uploadImage'

const BoardOperation = () => {
  const { t } = useTranslation()
  const { mode } = useBoardStore()
  const [showFile, updateShowFile] = useState(false)
  const [downloadImageURL, setDownloadImageURL] = useState('')
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [uploadImageURL, setUploadImageURL] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)

  // copy activity object
  const copyObject = () => {
    paintBoard.copyObject()
  }

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

  // upload image file
  const uploadImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = (fEvent) => {
      const data = fEvent.target?.result
      if (data) {
        if (data && typeof data === 'string') {
          setUploadImageURL(data)
          setShowUploadModal(true)
        }
      }
      e.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  // save as image
  const saveImage = () => {
    if (paintBoard.canvas) {
      const url = paintBoard.canvas.toDataURL()
      setDownloadImageURL(url)
      setShowDownloadModal(true)
    }
  }

  return (
    <>
      <div className="fixed top-6 left-1/2 -translate-x-1/2 flex gap-3 bg-[#eef1ff] rounded-lg shadow-xl p-2">
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
          <>
            {/* <button
              onClick={copyObject}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 text-gray-600 hover:bg-gray-100"
              title={t('operate.copy').toString()}
            >
              <Copy size={16} />
            </button> */}
            <button
              onClick={deleteObject}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 text-gray-600 hover:bg-gray-100"
              title={t('operate.delete').toString()}
            >
              <Trash2 size={16} />
            </button>
          </>
        )}

        {/* <label
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 text-gray-600 hover:bg-gray-100 cursor-pointer"
          title={t('operate.image').toString()}
        >
          <Upload size={16} />
          <input
            type="file"
            id="image-upload"
            accept=".jpeg, .jpg, .png"
            className="hidden"
            onChange={uploadImage}
          />
        </label> */}

        <label
          htmlFor="clean-modal"
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 text-gray-600 hover:bg-gray-100 cursor-pointer"
          title={t('operate.clean').toString()}
        >
          <Delete size={16} />
        </label>

        <button
          onClick={saveImage}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 text-gray-600 hover:bg-gray-100"
          title={t('operate.save').toString()}
        >
          <Save size={16} />
        </button>

        <label
          htmlFor="my-drawer-4"
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 text-gray-600 hover:bg-gray-100 cursor-pointer"
          title={t('operate.fileList').toString()}
          onClick={() => updateShowFile(true)}
        >
          <Files size={16} />
        </label>
      </div>

      {showFile && <FileList updateShow={updateShowFile} />}
      {showDownloadModal && downloadImageURL && (
        <DownloadImage
          url={downloadImageURL}
          showModal={showDownloadModal}
          setShowModal={setShowDownloadModal}
        />
      )}
      <UploadImage
        url={uploadImageURL}
        showModal={showUploadModal}
        setShowModal={setShowUploadModal}
      />
    </>
  )
}

export default BoardOperation
