import * as vscode from 'vscode';
import { getTexts } from './services/configService';
import { startTimers, resetAllTimers, clearAllTimers } from './services/timerService';
import { showCurrentStatus } from './services/statusService';
// 导入reminderUI以确保提醒函数被正确注册
// 这是解决循环依赖的关键步骤
import './ui/reminderUI';

/**
 * 插件激活函数
 * 当插件被VS Code激活时调用
 *
 * 实现了以下功能：
 * 1. 注册命令
 * 2. 启动健康提醒计时器
 * 3. 监听配置变化
 *
 * @param context 插件上下文
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('健康提醒插件已激活');

    // 注册重置计时器命令
    const resetCommand = vscode.commands.registerCommand('healthReminder.resetTimers', () => {
        resetAllTimers();
        const texts = getTexts();
        vscode.window.showInformationMessage(texts.resetMessage);
    });

    // 注册显示状态命令
    const statusCommand = vscode.commands.registerCommand('healthReminder.showStatus', () => {
        showCurrentStatus();
    });

    // 将命令添加到上下文订阅中，确保插件卸载时命令被正确释放
    context.subscriptions.push(resetCommand, statusCommand);

    // 启动健康提醒计时器
    startTimers();

    // 监听配置变化，当健康提醒配置改变时重置计时器
    vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('healthReminder')) {
            resetAllTimers();
        }
    });
}

/**
 * 插件停用函数
 * 当插件被VS Code停用时调用
 * 清除所有计时器，释放资源
 */
export function deactivate() {
    clearAllTimers();
}
