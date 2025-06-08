"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const configService_1 = require("./services/configService");
const timerService_1 = require("./services/timerService");
const statusService_1 = require("./services/statusService");
// 导入reminderUI以确保提醒函数被正确注册
// 这是解决循环依赖的关键步骤
require("./ui/reminderUI");
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
function activate(context) {
    console.log('健康提醒插件已激活');
    // 注册重置计时器命令
    const resetCommand = vscode.commands.registerCommand('healthReminder.resetTimers', () => {
        (0, timerService_1.resetAllTimers)();
        const texts = (0, configService_1.getTexts)();
        vscode.window.showInformationMessage(texts.resetMessage);
    });
    // 注册显示状态命令
    const statusCommand = vscode.commands.registerCommand('healthReminder.showStatus', () => {
        (0, statusService_1.showCurrentStatus)();
    });
    // 将命令添加到上下文订阅中，确保插件卸载时命令被正确释放
    context.subscriptions.push(resetCommand, statusCommand);
    // 启动健康提醒计时器
    (0, timerService_1.startTimers)();
    // 监听配置变化，当健康提醒配置改变时重置计时器
    vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('healthReminder')) {
            (0, timerService_1.resetAllTimers)();
        }
    });
}
/**
 * 插件停用函数
 * 当插件被VS Code停用时调用
 * 清除所有计时器，释放资源
 */
function deactivate() {
    (0, timerService_1.clearAllTimers)();
}
//# sourceMappingURL=extension.js.map