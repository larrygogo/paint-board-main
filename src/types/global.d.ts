interface Window {
  webkit?: {
    messageHandlers: {
      clearCanvas: {
        postMessage: (message: string) => void
      }
      requestTransform: {
        postMessage: (message: string) => void
      }
      messageHandler: {
        postMessage: (message: string) => void
      }
    }
  }
  receiveImage: (imageUrl: string) => void
  clearCanvasConfirm: () => void
}
