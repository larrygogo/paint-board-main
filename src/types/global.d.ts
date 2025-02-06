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
      requestBackground: {
        postMessage: (message: string) => void
      }
    }
  }
  receiveImage?: (imageUrl: string) => void
  clearCanvasConfirm?: () => void
}

declare module 'fabric' {
  interface Canvas {
    __eventListeners: Record<string, Array<(...args: any[]) => void>>
  }
}
