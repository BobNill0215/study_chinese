import { Events } from 'phaser';

/**
 * 全局事件总线 — 用于场景间通信（无 React 层后仅作可选工具）
 * 新架构中场景切换通过 scene.start(data) 直接传参，本总线保留以备扩展。
 */
export const EventBus = new Events.EventEmitter();
