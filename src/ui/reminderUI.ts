import * as vscode from 'vscode';
import { getConfig, getTexts } from '../services/configService';
import { resetSitTimer, resetDrinkTimer, setSitReminderFunction, setDrinkReminderFunction } from '../services/timerService';

/**
 * 初始化提醒功能
 * 通过设置函数引用，解决循环依赖问题
 * 这种方式允许timerService调用UI功能，而UI模块也可以调用timerService的功能
 */
setSitReminderFunction(() => showSitReminder());
setDrinkReminderFunction(() => showDrinkReminder());

/**
 * 显示久坐提醒
 * 创建一个模态窗口，提醒用户起身活动
 * 确认后会重置久坐计时器
 */
export async function showSitReminder(): Promise<void> {
    const texts = getTexts();
    await showReminderModal(texts.sitReminderTitle, texts.sitReminderMessage, texts.sitReminderButton, resetSitTimer);
}

/**
 * 显示喝水提醒
 * 创建一个模态窗口，提醒用户喝水
 * 确认后会重置喝水计时器
 */
export async function showDrinkReminder(): Promise<void> {
    const texts = getTexts();
    await showReminderModal(texts.drinkReminderTitle, texts.drinkReminderMessage, texts.drinkReminderButton, resetDrinkTimer);
}

/**
 * 显示一个模态提醒窗口，阻止用户进行其他操作直到确认
 *
 * 实现了以下功能：
 * 1. 创建一个全屏WebView面板
 * 2. 阻止键盘输入和其他操作
 * 3. 确保面板始终保持在前台
 * 4. 用户确认后重置相应的计时器
 * 5. 释放所有资源
 *
 * @param title 提醒标题
 * @param message 提醒消息
 * @param buttonText 确认按钮文本
 * @param onConfirm 确认后的回调函数
 */
async function showReminderModal(title: string, message: string, buttonText: string, onConfirm: () => void): Promise<void> {
    // 创建webview面板作为全屏模态窗口
    const panel = vscode.window.createWebviewPanel(
        'healthReminder',
        '健康提醒',
        {
            viewColumn: vscode.ViewColumn.One,
            preserveFocus: false
        },
        {
            enableScripts: true,
            retainContextWhenHidden: true,
        }
    );

    // 生成HTML内容
    const html = generateReminderHTML(title, message, buttonText);
    panel.webview.html = html;

    // 确保面板获得焦点并处于活动状态
    panel.reveal(vscode.ViewColumn.One, true);

    // 创建一个模态状态，阻止其他操作
    const disposables: vscode.Disposable[] = [];

    // 添加状态栏提示
    const statusBarItem = createBlockingStatusBarItem();
    disposables.push(statusBarItem);

    // 阻止键盘输入
    const keyboardDisposable = blockKeyboardInput(panel);
    disposables.push(keyboardDisposable);

    // 阻止所有命令执行
    const blockCommandsDisposable = blockAllCommands(panel);
    disposables.push(blockCommandsDisposable);

    // 阻止编辑器操作
    const blockEditorDisposable = blockEditorOperations(panel);
    disposables.push(blockEditorDisposable);

    // 处理webview消息
    const messageHandler = panel.webview.onDidReceiveMessage(message => {
        if (message.command === 'confirm') {
            // 释放所有阻止操作的资源
            disposables.forEach(d => d.dispose());
            panel.dispose();
            onConfirm();
            const texts = getTexts();
            vscode.window.showInformationMessage(texts.confirmMessage);
        }
    });
    disposables.push(messageHandler);

    // 防止面板被意外关闭
    panel.onDidDispose(() => {
        // 如果面板被关闭，也释放所有资源
        disposables.forEach(d => d.dispose());
    });

    // 持续确保面板保持在前台
    const interval = setInterval(() => {
        if (panel.visible) {
            panel.reveal(vscode.ViewColumn.One, true);
        } else {
            clearInterval(interval);
        }
    }, 300);

    // 当确认后清除间隔
    disposables.push({ dispose: () => clearInterval(interval) });
}

/**
 * 创建阻止操作的状态栏提示
 * 在状态栏显示警告消息，提醒用户当前处于提醒状态
 */
function createBlockingStatusBarItem(): vscode.StatusBarItem {
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "$(alert) 健康提醒中，请先处理提醒";
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    statusBarItem.show();
    return statusBarItem;
}

/**
 * 阻止键盘输入，将焦点重定向到提醒面板
 * 通过覆盖type命令，阻止用户在编辑器中输入文本
 * 当用户尝试输入时，会自动将焦点重定向到提醒面板
 */
function blockKeyboardInput(panel: vscode.WebviewPanel): vscode.Disposable {
    return vscode.commands.registerCommand('type', () => {
        panel.reveal(vscode.ViewColumn.One, true);
        return null;
    }, null);
}

/**
 * 阻止所有常用命令执行
 * 通过覆盖常用命令，阻止用户执行各种操作
 */
function blockAllCommands(panel: vscode.WebviewPanel): vscode.Disposable {
    // 创建一个复合的disposable对象
    const disposables: vscode.Disposable[] = [];

    // 常见的命令列表
    const commonCommands = [
        'workbench.action.files.save',
        'workbench.action.files.saveAs',
        'workbench.action.files.saveAll',
        'workbench.action.openSettings',
        'workbench.action.closeActiveEditor',
        'workbench.action.closeAllEditors',
        'workbench.action.navigateBack',
        'workbench.action.navigateForward',
        'editor.action.formatDocument',
        'editor.action.goToDeclaration',
        'editor.action.goToDefinition',
        'editor.action.referenceSearch.trigger',
        'editor.action.rename',
        'editor.action.sourceAction',
        'editor.action.codeAction',
        'editor.action.quickFix',
        'editor.action.organizeImports',
        'editor.action.clipboardCopyAction',
        'editor.action.clipboardCutAction',
        'editor.action.clipboardPasteAction',
        'search.action.openNewEditor',
        'search.action.openNewEditorToSide',
        'workbench.action.quickOpen',
        'workbench.action.showCommands',
        'workbench.action.terminal.toggleTerminal',
        'workbench.action.terminal.new',
        'workbench.action.tasks.runTask',
        'workbench.action.debug.start',
        'workbench.action.debug.run',
        'workbench.action.debug.stop',
        'workbench.action.debug.restart',
        'workbench.action.debug.continue',
        'workbench.view.explorer',
        'workbench.view.search',
        'workbench.view.scm',
        'workbench.view.debug',
        'workbench.view.extensions'
    ];

    // 为每个命令注册一个拦截器
    for (const cmd of commonCommands) {
        const disposable = vscode.commands.registerCommand(cmd, () => {
            panel.reveal(vscode.ViewColumn.One, true);
            return null;
        }, null);
        disposables.push(disposable);
    }

    // 返回一个复合的disposable对象
    return { dispose: () => disposables.forEach(d => d.dispose()) };
}

/**
 * 阻止编辑器操作
 * 通过监听编辑器变化事件，阻止用户进行编辑操作
 */
function blockEditorOperations(panel: vscode.WebviewPanel): vscode.Disposable {
    const disposables: vscode.Disposable[] = [];

    // 监听编辑器选择变化事件
    const selectionChangeDisposable = vscode.window.onDidChangeTextEditorSelection(() => {
        panel.reveal(vscode.ViewColumn.One, true);
    });
    disposables.push(selectionChangeDisposable);

    // 监听编辑器可见性变化事件
    const visibilityChangeDisposable = vscode.window.onDidChangeVisibleTextEditors(() => {
        panel.reveal(vscode.ViewColumn.One, true);
    });
    disposables.push(visibilityChangeDisposable);

    // 监听活动编辑器变化事件
    const activeEditorChangeDisposable = vscode.window.onDidChangeActiveTextEditor(() => {
        panel.reveal(vscode.ViewColumn.One, true);
    });
    disposables.push(activeEditorChangeDisposable);

    // 返回一个复合的disposable对象
    return { dispose: () => disposables.forEach(d => d.dispose()) };
}

/**
 * 生成提醒HTML内容
 * 创建一个美观的提醒界面，包含标题、消息和确认按钮
 * 实现了以下功能：
 * 1. 响应式设计，适应不同屏幕尺寸
 * 2. 动画效果，提高用户体验
 * 3. 倒计时功能，防止用户立即关闭提醒
 * 4. 阻止页面关闭和键盘事件
 */
function generateReminderHTML(title: string, message: string, buttonText: string): string {
    const texts = getTexts();
    const isEnglish = getConfig().language === 'en';

    return `
<!DOCTYPE html>
<html lang="${isEnglish ? 'en' : 'zh-CN'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${isEnglish ? 'Health Reminder' : '健康提醒'}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: ${
                isEnglish
                    ? '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif'
                    : '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
            };
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 999999;
        }

        .reminder-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 60px 80px;
            text-align: center;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
            max-width: 600px;
            width: 90%;
            animation: slideIn 0.5s ease-out;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: scale(0.9) translateY(-20px);
            }
            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }

        .title {
            font-size: 2.5em;
            color: #333;
            margin-bottom: 20px;
            font-weight: 600;
        }

        .message {
            font-size: 1.2em;
            color: #666;
            line-height: 1.6;
            margin-bottom: 40px;
        }

        .confirm-btn {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 15px 40px;
            font-size: 1.1em;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
            opacity: 0.5;
            pointer-events: none;
        }

        .confirm-btn.enabled {
            opacity: 1;
            pointer-events: auto;
        }

        .confirm-btn.enabled:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 25px rgba(102, 126, 234, 0.4);
        }

        .countdown {
            font-size: 0.9em;
            color: #999;
            margin-top: 15px;
        }

        .pulse {
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
    </style>
</head>
<body>
    <div class="reminder-container pulse">
        <div class="title">${title}</div>
        <div class="message">${message}</div>
        <button id="confirmBtn" class="confirm-btn">${buttonText}</button>
        <div id="countdown" class="countdown">${texts.waitSeconds} <span id="seconds">3</span> ${
        isEnglish ? 'seconds...' : '秒...'
    }</div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const confirmBtn = document.getElementById('confirmBtn');
        const countdownEl = document.getElementById('countdown');
        const secondsEl = document.getElementById('seconds');

        let countdown = 3;

        // 倒计时逻辑
        const timer = setInterval(() => {
            countdown--;
            secondsEl.textContent = countdown;

            if (countdown <= 0) {
                clearInterval(timer);
                confirmBtn.classList.add('enabled');
                countdownEl.style.display = 'none';
            }
        }, 1000);

        // 确认按钮点击事件
        confirmBtn.addEventListener('click', () => {
            if (confirmBtn.classList.contains('enabled')) {
                vscode.postMessage({
                    command: 'confirm'
                });
            }
        });

        // 防止页面被意外关闭
        window.addEventListener('beforeunload', (e) => {
            e.preventDefault();
            e.returnValue = '';
        });

        // 获得焦点
        window.focus();
        document.body.focus();

        // 阻止键盘事件
        document.addEventListener('keydown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }, true);

        // 阻止鼠标点击事件传播到编辑器
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.reminder-container')) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }, true);
    </script>
</body>
</html>`;
}
