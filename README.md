# Health Reminder - 健康提醒插件

一个极简的 VS Code 插件，提供久坐和喝水的强制提醒功能。

## 关于作者

-   作者：[Immerse](https://yaolifeng.com)
-   博客：[https://yaolifeng.com](https://yaolifeng.com)
-   公众号：[沉浸式趣谈](https://yaolifeng.com/sponsor/wx_public_account.webp)
-   Github: [https://github.com/yaolifeng0629](https://github.com/yaolifeng0629)
-   个人介绍：一名独立开发者、内容创作者。分享关于`编程`、`独立开发`、`AI干货`、`开源`、`个人思考`等有趣的内容。

## 🌟 核心功能

### 独立计时器

-   **久坐计时器**: 跟踪工作时间，默认 60 分钟提醒
-   **喝水计时器**: 跟踪饮水间隔，默认 45 分钟提醒
-   **自动重置**: 每次确认提醒后，对应计时器自动重置

### 强制性全屏提醒

-   **全屏模态窗口**: 提醒时显示不可关闭的全屏弹窗
-   **UI 锁定**: 必须确认提醒才能继续工作
-   **延迟确认**: 3 秒倒计时后才能点击确认按钮
-   **美观界面**: 渐变背景、毛玻璃效果、动画过渡

## ⚙️ 配置选项

在 VS Code 设置中搜索"健康提醒"或直接编辑`settings.json`:

```json
{
    "healthReminder.sitReminderInterval": 60, // 久坐提醒间隔（分钟）
    "healthReminder.drinkReminderInterval": 45, // 喝水提醒间隔（分钟）
    "healthReminder.enableSitReminder": true, // 启用久坐提醒
    "healthReminder.enableDrinkReminder": true, // 启用喝水提醒
    "healthReminder.language": "zh-CN" // 界面语言: "zh-CN" 或 "en"
}
```

### 🌐 语言支持

插件支持两种语言：

-   **中文简体** (`zh-CN`) - 默认
-   **English** (`en`)

可通过配置 `healthReminder.language` 来切换语言，所有界面文本（包括提醒弹窗、按钮、状态消息等）都会相应切换。

## 🎮 命令

-   `健康提醒: 重置所有计时器` - 手动重置所有计时器
-   `健康提醒: 显示提醒状态` - 查看当前计时器状态

## 📦 安装方法

### 方法一：从 VS Code 扩展市场安装

1. 打开 VS Code 扩展市场
2. 搜索 "健康提醒"
3. 点击 "安装"

### 方法二：从源码安装

1. 克隆或下载项目文件
2. 在项目目录运行 `npm install`
3. 运行 `npm run compile` 编译 TypeScript
4. 在 VS Code 中按 `F5` 运行调试，或打包成 `.vsix` 文件安装

## 🔧 开发

```bash
# 安装依赖
npm install

# 编译
npm run compile

# 监听模式编译
npm run watch
```

## 📝 文件结构

```
health-reminder/
├── package.json          # 插件配置
├── tsconfig.json         # TypeScript配置
├── src/
│   └── extension.ts      # 主要逻辑
├── out/                  # 编译输出
└── README.md            # 说明文档
```

## 🎯 特色

-   **极简设计**: 只关注核心功能，不添加复杂特性
-   **强制性提醒**: 确保用户真正注意到健康提醒
-   **美观界面**: 现代化的 UI 设计，提供良好的用户体验
-   **独立计时**: 久坐和喝水提醒互不干扰
-   **可配置**: 支持自定义间隔时间和开关控制

## 💡 使用建议

-   建议久坐提醒间隔设置为 45-60 分钟
-   建议喝水提醒间隔设置为 30-45 分钟
-   工作时保持插件开启，养成良好的健康习惯

## 💰 打赏

如果觉得这个插件对你有帮助，欢迎打赏我，你的支持是我最大的动力。

<img src="https://yaolifeng.com/sponsor/weixin.png" alt="微信打赏" width="200" height="200">
<img src="https://yaolifeng.com/sponsor/ali.png" alt="支付宝打赏" width="200" height="200">

## 🤝 支持

如有问题或建议，欢迎提出 Issue 或贡献代码。

---

先保持健康，再高效工作！💪
