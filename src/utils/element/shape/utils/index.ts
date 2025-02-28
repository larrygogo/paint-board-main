import useShapeStore from '@/store/shape'

export const getShapeBorderWidth = () => {
  const borderWidth = useShapeStore.getState().borderWidth
  return borderWidth
}
