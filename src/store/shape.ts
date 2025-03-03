import { ShapeStyle } from '@/constants/shape'
import { create } from 'zustand'

interface ShapeState {
  shapeStyle: string // shape style
  borderColor: string // border Color
  borderWidth: number // border width
  shapeLinePointCount: number // Number of line segment turning points
}

interface ShapeAction {
  updateShapeStyle: (shapeStyle: string) => void
  updateBorderColor: (borderColor: string) => void
  updateBorderWidth: (borderWidth: number) => void
  updateShapeLinePointCount: (count: number) => void
}

const useShapeStore = create<ShapeState & ShapeAction>()((set, get) => ({
  shapeStyle: ShapeStyle.Rect,
  borderColor: '#FF0000',
  borderWidth: 5,
  shapeLinePointCount: 3,
  updateShapeStyle(shapeStyle) {
    const oldShapeStyle = get().shapeStyle
    if (oldShapeStyle !== shapeStyle) {
      set({
        shapeStyle
      })
    }
  },
  updateBorderColor: (borderColor) => {
    const oldBorderColor = get().borderColor
    if (oldBorderColor !== borderColor) {
      set({
        borderColor
      })
    }
  },
  updateBorderWidth: (borderWidth) => {
    const oldBorderWidth = get().borderWidth
    if (oldBorderWidth !== borderWidth) {
      set({
        borderWidth
      })
    }
  },
  updateShapeLinePointCount(count) {
    const oldCount = get().shapeLinePointCount
    if (count !== oldCount) {
      set({
        shapeLinePointCount: count
      })
    }
  }
}))

export default useShapeStore
