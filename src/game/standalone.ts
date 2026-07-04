import { createGame } from './config';

// 独立入口：直接启动 Phaser 游戏（无需 React）
const game = createGame('game-container');

// 暴露 game 实例到 window 便于调试
if (typeof window !== 'undefined') {
  (window as unknown as { game: typeof game }).game = game;
}

// 移除 HTML 加载提示（Phaser.Game 构造时已同步创建 canvas）
function removeLoadingHint() {
  const loading = document.getElementById('loading');
  if (loading) loading.remove();
}
removeLoadingHint();
// 兜底：1 秒后若 loading 仍在则移除
setTimeout(removeLoadingHint, 1000);

// 强制 ScaleManager 刷新画布边界——修复布局变化导致 canvasBounds 过时
function refreshInputBounds() {
  if (game.scale && typeof game.scale.refresh === 'function') {
    game.scale.refresh();
  }
}

// 多次刷新覆盖初始化阶段的各种时序
setTimeout(refreshInputBounds, 100);
setTimeout(refreshInputBounds, 500);
setTimeout(refreshInputBounds, 1000);
setTimeout(refreshInputBounds, 2000);

// 窗口尺寸变化时刷新
window.addEventListener('resize', refreshInputBounds);
window.addEventListener('orientationchange', refreshInputBounds);

// ResizeObserver: 监听画布尺寸变化（FIT 模式下窗口缩放会改变 canvas CSS 尺寸）
if (typeof ResizeObserver !== 'undefined' && game.canvas) {
  const resizeObserver = new ResizeObserver(() => {
    refreshInputBounds();
  });
  resizeObserver.observe(game.canvas);
  resizeObserver.observe(document.getElementById('game-container') || document.body);
}

// Phaser READY 事件后刷新
game.events.once('ready' as never, refreshInputBounds);

export { game };
