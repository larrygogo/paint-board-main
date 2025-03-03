import { fabric } from 'fabric'
import 'fabric/src/mixins/eraser_brush.mixin.js'

import { History } from './history'
import { ActionMode, ELEMENT_CUSTOM_TYPE } from '@/constants'
import { DrawStyle, DrawType } from '@/constants/draw'

import { v4 as uuidv4 } from 'uuid'
import { CanvasEvent } from './event'
import { TextElement } from './element/text'
import { renderPencilBrush } from './element/draw/basic'
import { getEraserWidth } from './common/draw'

import useDrawStore from '@/store/draw'
import useBoardStore from '@/store/board'

/**
 * PaintBoard
 */
export class PaintBoard {
  canvas: fabric.Canvas | null = null
  event: CanvasEvent | null = null
  history: History | null = null
  readonly textElement: TextElement
  readonly hookFn: Array<() => void> = []

  private static readonly DEFAULT_SETTINGS: fabric.ICanvasOptions = {
    selectionColor: 'rgba(101, 204, 138, 0.3)', // 选中颜色
    preserveObjectStacking: true, // 保持对象堆叠
    enableRetinaScaling: true, // 启用视网膜缩放
    backgroundVpt: false, // 背景视图转换
    backgroundColor: '#FFFFFF', // 背景颜色
    width: Math.min(640, window.innerWidth * 0.9), // 最大宽度640px且不超过屏幕宽度的90%
    height: Math.min(640, window.innerWidth * 0.9) // 保持正方形
  }

  constructor() {
    this.textElement = new TextElement()
  }

  /**
   * 初始化画布
   * @param canvasEl 画布元素
   * @returns 是否初始化成功
   */
  initCanvas(canvasEl: HTMLCanvasElement): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      this.canvas = new fabric.Canvas(canvasEl, {
        ...PaintBoard.DEFAULT_SETTINGS
      })

      this.initObjectPrototypes()
      this.event = new CanvasEvent()
      this.handleMode()

      await this.initCanvasStorage()
      resolve(true)
    })
  }

  /**
   * 初始化对象原型
   */
  private initObjectPrototypes(): void {
    if (!this.canvas) return

    fabric.Object.prototype.set({
      borderColor: '#65CC8A',
      cornerColor: '#65CC8A',
      cornerStyle: 'circle',
      borderDashArray: [3, 3],
      transparentCorners: false
    })

    fabric.Line.prototype.strokeLineJoin = 'round'
    fabric.Line.prototype.strokeLineCap = 'round'
  }

  removeCanvas() {
    if (this.canvas) {
      this?.canvas?.dispose()
      this.event?.removeEvent()
      this.canvas = null
    }
  }

  /**
   * Initialize the canvas cache
   */
  initCanvasStorage() {
    return new Promise((resolve) => {
      if (this.canvas) {
        this.canvas.clear()
        this.canvas.setBackgroundColor('#FFFFFF', () => {
          this.render()
        })

        fabric.Object.prototype.set({
          objectCaching: useBoardStore.getState().isObjectCaching
        })
        this.canvas.renderAll()
        this.triggerHook()
        this.history = new History()
      }
      resolve(true)
    })
  }

  /**
   * 处理操作模式
   * @param mode 当前模式
   */
  handleMode(mode: string = useBoardStore.getState().mode) {
    if (!this.canvas) {
      return
    }
    let isDrawingMode = false
    let selection = false
    const objectSet: Partial<fabric.IObjectOptions> = {
      selectable: false,
      hoverCursor: 'default'
    }

    switch (mode) {
      case ActionMode.DRAW:
        if (
          useBoardStore.getState().drawType === DrawType.FreeStyle &&
          [DrawStyle.Basic].includes(useDrawStore.getState().drawStyle)
        ) {
          isDrawingMode = true
          this.handleDrawStyle()
        }
        this.canvas.discardActiveObject()
        break
      case ActionMode.ERASE:
        isDrawingMode = true
        this.canvas.freeDrawingBrush = new (fabric as any).EraserBrush(
          this.canvas
        )
        this.canvas.freeDrawingBrush.width = getEraserWidth()
        this.canvas.freeDrawingBrush.color = '#FFF'
        this.canvas.discardActiveObject()
        break
      case ActionMode.Board:
      case ActionMode.SELECT:
        objectSet.selectable = true
        objectSet.hoverCursor = undefined
        selection = true
        break
      default:
        break
    }
    this.canvas.isDrawingMode = isDrawingMode
    this.canvas.selection = selection
    fabric.Object.prototype.set(objectSet)

    this.canvas.forEachObject((obj) => {
      if (obj._customType === ELEMENT_CUSTOM_TYPE.I_TEXT) {
        obj.selectable = objectSet.selectable
        obj.hoverCursor = objectSet.hoverCursor
      }
    })

    this.canvas.requestRenderAll()
  }

  /**
   * 处理绘制样式
   */
  handleDrawStyle() {
    if (!this.canvas) {
      return
    }
    const drawStyle = useDrawStore.getState().drawStyle
    switch (drawStyle) {
      case DrawStyle.Basic:
        renderPencilBrush()
        break
      default:
        this.canvas.isDrawingMode = false
        break
    }
  }

  /**
   * 删除活动对象
   */
  deleteObject(): void {
    if (!this.canvas || this.textElement.isTextEditing) return

    const activeObjects = this.canvas.getActiveObjects()
    if (!activeObjects?.length) return

    this.canvas.discardActiveObject()
    activeObjects.forEach((obj) => this.canvas?.remove(obj))
    this.render()
  }

  /**
   * 渲染并保存历史状态
   */
  render() {
    if (this.canvas) {
      this.canvas?.requestRenderAll()
      this.history?.saveState()
    }
  }

  /**
   * 复制活动对象
   */
  async copyObject(): Promise<void> {
    if (!this.canvas) return

    const targets = this.canvas.getActiveObjects()
    if (targets.length <= 0) return

    this.canvas.discardActiveObject()

    const copiedObjects = await Promise.all(
      targets.map((target) => this.cloneObject(target))
    )

    const activeSelection = new fabric.ActiveSelection(copiedObjects, {
      canvas: this.canvas
    })

    this.canvas.setActiveObject(activeSelection)
    this.render()
  }

  private cloneObject(target: fabric.Object): Promise<fabric.Object> {
    return new Promise((resolve) => {
      target?.clone((cloned: fabric.Object) => {
        const id = uuidv4()
        cloned.set({
          left: (cloned?.left || 0) + 10,
          top: (cloned?.top || 0) + 10,
          evented: true,
          id,
          perPixelTargetFind: true
        })
        this.canvas?.add(cloned)
        resolve(cloned)
      })
    })
  }

  /**
   * 通过 fabric 的 bringForward 方法移动活动对象
   */
  bringForWard() {
    const canvas = this.canvas
    if (canvas) {
      const object = canvas.getActiveObject()
      if (object) {
        canvas.bringForward(object, true)
        this.render()
      }
    }
  }

  /**
   * 通过 fabric 的 sendBackwards 方法移动活动对象
   */
  seendBackWard() {
    const canvas = this.canvas
    if (canvas) {
      const object = canvas.getActiveObject()
      if (object) {
        canvas.sendBackwards(object, true)
        this.render()
      }
    }
  }

  /**
   * 通过 fabric 的 bringToFront 方法移动活动对象
   */
  bringToFront() {
    const canvas = this.canvas
    if (canvas) {
      const object = canvas.getActiveObject()
      if (object) {
        canvas.bringToFront(object)
        this.render()
      }
    }
  }

  /**
   * 通过 fabric 的 sendToBack 方法移动活动对象
   */
  sendToBack() {
    const canvas = this.canvas
    if (canvas) {
      const object = canvas.getActiveObject()
      if (object) {
        canvas.sendToBack(object)
        this.render()
      }
    }
  }

  /**
   * 添加钩子函数以在更新时触发
   * @param fn 钩子函数
   */
  addHookFn(fn: () => void) {
    this.hookFn.push(fn)
  }

  /**
   * 移除触发钩子函数
   * @param fn 钩子函数
   */
  removeHookFn(fn: () => void) {
    const hookIndex = this.hookFn.findIndex((v) => v === fn)
    if (hookIndex > -1) {
      this.hookFn.splice(hookIndex, 1)
    }
  }

  /**
   * 触发钩子函数
   */
  triggerHook() {
    this.hookFn.map((fn) => {
      fn?.()
    })
  }

  /**
   * 临时禁用所有事件监听并执行回调
   * @param callback 回调
   * @returns 回调结果
   */
  executeWithoutListeners<T>(callback: () => T): T {
    if (!this.canvas) {
      throw new Error('Canvas is not initialized')
    }

    // 保存当前的事件监听器
    const currentListeners = { ...this.canvas.__eventListeners }

    // 清空所有事件监听器
    this.canvas.__eventListeners = {}

    try {
      // 执行回调
      const result = callback()
      return result
    } finally {
      // 恢复事件监听器
      this.canvas.__eventListeners = currentListeners
    }
  }
}

export const paintBoard = new PaintBoard()
