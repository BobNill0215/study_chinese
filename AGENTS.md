# AGENTS.md — 给 AI 协作助手的项目指南

> 本文件供 Sisyphus / opencode / Cursor / Claude Code 等 AI agent 在本仓库工作时遵守。两台电脑协作时，clone 后让 AI 先读本文件。

## 1. 项目简介

- **study_chinese**：面向小学生的语文启蒙 Phaser 游戏。Web 前端纯静态产物，无后端。
- 技术栈：Vite 8 + TypeScript 6 + Phaser 4 + esbuild。
- 不发布到 npm（`"private": true`），最终产物是 `dist/` 静态文件，可直接托管。
- 在两台开发电脑间通过 GitHub 同步；不做 CI，靠本地 `npm run build` 保证类型/构建正确。

## 2. 目录结构

```
study_chinese/
├── index.html              # 入口页面
├── vite.config.ts          # Vite 配置
├── inline-assets.cjs       # 构建后内联资源进 dist
├── public/                  # 静态资源
├── src/
│   └── game/
│       ├── config.ts        # 全局配置
│       ├── EventBus.ts
│       ├── standalone.ts    # 独立运行入口
│       ├── data/            # 题库数据：characters / classics / culture / idioms / poems
│       ├── scenes/          # Boot/Preloader/MainMenu/ChineseGame/LevelSelect/LevelComplete/Report
│       └── utils/          # DifficultyManager / LevelSystem / QuestionGenerator
│                            / RewardEffects / Settings / SoundManager / SpeechManager
└── README.md                # 详细使用说明
```

> `data/*.ts` 是题库内容，改动多在内容层，不要在题库里塞游戏逻辑。

## 3. 关键命令

```powershell
npm install              # 安装依赖（首次 / package.json 变化后）
npm run dev              # 启 Vite dev server
npm run build            # 生产构建：vite build && node inline-assets.cjs
npm run preview          # 预览构建产物
```

## 4. 代码约定

- TypeScript 严格模式（`tsconfig.app.json`），**禁止** `as any` / `@ts-ignore` / `@ts-expect-error`。
- ESM（`"type": "module"`），新文件用 `import`/`export`。`.cjs` 文件例外。
- Phaser 场景之间用 `EventBus`，不要互相引用实例。
- 题库数据放 `src/game/data/*.ts`，关卡/速度等数值放 `config.ts` 或 `utils/DifficultyManager.ts`。
- `SpeechManager` / `SoundManager` 是音/语音播放统一入口，不要在场景里直接 `new Audio()`。

## 5. AI agent 工作约定

1. **改动前先 `git pull --rebase`**。
2. **改动后必跑** `npm run build`，类型/构建通过再 commit。**不准 `as any` 压报错**。
3. **commit message 推荐** Conventional Commits：
   - `feat: 新增古诗关卡数据`
   - `fix: 修复成语题随机不重复`
   - `docs: 更新 README 用法`
4. **禁止提交**：`node_modules/`、`dist/`、`.sisyphus/`、`*.log`、`.env`。已 `.gitignore`。
5. **改题库（`data/*.ts`）前**先确认数据结构（数组元素类型 / id 字段），别破坏 `QuestionGenerator` 的契约。
6. **不要"顺手清理"或重构**，bug fix 就只修 bug。
7. **改场景前**先读 `EventBus.ts` 和 `utils/LevelSystem.ts`，理解事件流和关卡推进逻辑再动。

## 6. 两台电脑协作流程

```powershell
# A 机
git add -A
git commit -m "feat: ..."
git push

# B 机
git pull --rebase
# 干活
git add -A && git commit -m "..." && git push
```

冲突：

```powershell
git pull --rebase
# 编辑器修 <<<< ==== >>>> 标记
git add <冲突文件>
git rebase --continue
git push
```

## 7. 提交记录规范

- 频繁小提交 > 一次大提交。
- 提交前 `git status -s` 看清要交付什么。
- 不要 `git push --force` 到 `main`。