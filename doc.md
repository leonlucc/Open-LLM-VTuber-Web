该工程是一个基于 Electron、React 和 TypeScript 的桌面应用，项目名称为 open-llm-vtuber-electron。主要特性和结构如下：

技术栈：Electron（桌面端）、React（前端 UI）、TypeScript（类型安全）、Vite（构建工具）。
目录结构：
main：Electron 主进程代码。
preload：预加载脚本。
renderer：前端页面，采用 React 实现。
配置文件：
electron.vite.config.ts 和 vite.config.ts：分别用于 Electron 和 Web 的 Vite 配置。
electron-builder.yml：打包配置，支持多平台（Windows、macOS、Linux）。
tsconfig.*.json：TypeScript 配置，分别针对主进程、渲染进程和 Node 环境。
依赖：集成了 Live2D、ONNX Runtime、VAD（语音活动检测）等第三方库，支持语音驱动的 VTuber 功能。
构建与开发：
npm run dev 启动开发环境。
npm run build:win|mac|linux 分别打包对应平台的应用。


chat-history-panel.tsx 聊天消息入口

在当前（chat-history-panel.tsx），messages 是通过自定义 Hook useChatHistory() 获取的：

实现原理：
useChatHistory 通常来自全局的聊天历史上下文（chat-history-context）。
该上下文会监听 WebSocket 消息或其他数据源，当有新消息到来时自动更新 messages。
组件每次渲染时都会获取到最新的 messages，实现消息的实时更新和展示。
总结：


消息的文本在页面的展示流程如下：

获取消息数据
通过 useChatHistory() 获取到 messages 数组，每个元素包含消息内容（content）、发送者角色（role）、时间戳等信息。

过滤有效消息
用 validMessages 过滤掉内容为空的消息，只保留有实际内容的消息。

渲染消息列表
使用 ChatMessageList 组件遍历 validMessages，对每条消息渲染一个 ChatMessage 组件。

设置消息内容
在 ChatMessage 组件的 model 属性中，将 msg.content 作为 message 字段传递，这就是消息的文本内容。

https://chatscope.io/storybook/react/?path=/story/components-message--html-content