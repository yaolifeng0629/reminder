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
const assert = __importStar(require("assert"));
const sinon = __importStar(require("sinon"));
const vscode = __importStar(require("vscode"));
const extension = __importStar(require("../../extension"));
const timerService = __importStar(require("../../services/timerService"));
const statusService = __importStar(require("../../services/statusService"));
const configService = __importStar(require("../../services/configService"));
suite('Extension Test Suite', () => {
    let resetAllTimersStub;
    let showCurrentStatusStub;
    let clearAllTimersStub;
    let startTimersStub;
    let getTextsStub;
    let showInfoMessageStub;
    let registerCommandStub;
    let onDidChangeConfigurationStub;
    let mockContext;
    setup(() => {
        // 存根服务
        resetAllTimersStub = sinon.stub(timerService, 'resetAllTimers');
        showCurrentStatusStub = sinon.stub(statusService, 'showCurrentStatus');
        clearAllTimersStub = sinon.stub(timerService, 'clearAllTimers');
        startTimersStub = sinon.stub(timerService, 'startTimers');
        // 存根配置服务
        getTextsStub = sinon.stub(configService, 'getTexts');
        getTextsStub.returns({
            resetMessage: '所有计时器已重置',
            confirmMessage: '提醒已确认，计时器已重置'
        });
        // 存根 VS Code API
        showInfoMessageStub = sinon.stub(vscode.window, 'showInformationMessage');
        registerCommandStub = sinon.stub(vscode.commands, 'registerCommand');
        registerCommandStub.returns({ dispose: sinon.stub() });
        // 存根 VS Code 配置变更
        onDidChangeConfigurationStub = sinon.stub(vscode.workspace, 'onDidChangeConfiguration');
        onDidChangeConfigurationStub.returns({ dispose: sinon.stub() });
        // 创建模拟扩展上下文
        mockContext = {
            subscriptions: [],
            asAbsolutePath: (path) => path
        };
    });
    teardown(() => {
        // 恢复所有存根
        resetAllTimersStub.restore();
        showCurrentStatusStub.restore();
        clearAllTimersStub.restore();
        startTimersStub.restore();
        getTextsStub.restore();
        showInfoMessageStub.restore();
        registerCommandStub.restore();
        onDidChangeConfigurationStub.restore();
    });
    test('activate should register commands and start timers', () => {
        extension.activate(mockContext);
        // 验证命令注册
        assert.strictEqual(registerCommandStub.calledTwice, true, 'Two commands should be registered');
        assert.strictEqual(registerCommandStub.firstCall.args[0], 'healthReminder.resetTimers', 'Reset timers command should be registered');
        assert.strictEqual(registerCommandStub.secondCall.args[0], 'healthReminder.showStatus', 'Show status command should be registered');
        // 验证计时器启动
        assert.strictEqual(startTimersStub.calledOnce, true, 'Timers should be started once');
        // 验证配置变更监听
        assert.strictEqual(onDidChangeConfigurationStub.calledOnce, true, 'Configuration change listener should be registered');
    });
    test('resetTimers command should reset timers and show message', () => {
        // 获取第一个命令的回调函数
        extension.activate(mockContext);
        const resetTimersCallback = registerCommandStub.firstCall.args[1];
        // 执行回调
        resetTimersCallback();
        // 验证计时器重置和消息显示
        assert.strictEqual(resetAllTimersStub.calledOnce, true, 'Timers should be reset once');
        assert.strictEqual(showInfoMessageStub.calledOnce, true, 'Information message should be shown once');
        assert.strictEqual(showInfoMessageStub.firstCall.args[0], '所有计时器已重置', 'Correct reset message should be shown');
    });
    test('showStatus command should show status', () => {
        // 获取第二个命令的回调函数
        extension.activate(mockContext);
        const showStatusCallback = registerCommandStub.secondCall.args[1];
        // 执行回调
        showStatusCallback();
        // 验证状态显示
        assert.strictEqual(showCurrentStatusStub.calledOnce, true, 'Status should be shown once');
    });
    test('configuration change should reset timers when healthReminder settings change', () => {
        // 激活扩展
        extension.activate(mockContext);
        // 获取配置变更回调
        const configChangeCallback = onDidChangeConfigurationStub.firstCall.args[0];
        // 创建模拟配置变更事件
        const mockEvent = {
            affectsConfiguration: sinon.stub().returns(true)
        };
        // 执行回调
        configChangeCallback(mockEvent);
        // 验证计时器重置
        assert.strictEqual(resetAllTimersStub.calledTwice, true, 'Timers should be reset after config change');
    });
    test('deactivate should clear all timers', () => {
        extension.deactivate();
        // 验证计时器清除
        assert.strictEqual(clearAllTimersStub.calledOnce, true, 'All timers should be cleared on deactivation');
    });
});
//# sourceMappingURL=extension.test.js.map