import 'fabric'
declare global {
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
    android?: {
      clearCanvas: (message: string) => void
      requestTransform: (message: string) => void
      messageHandler: (message: string) => void
      requestBackground: (message: string) => void
    }
    receiveImage?: (imageUrl: string) => void
    clearCanvasConfirm?: () => void
  }
}

declare module 'fabric' {
  namespace fabric {
    interface Canvas {
      __eventListeners: Record<string, Array<(...args: any[]) => void>>
    }
  }
}
