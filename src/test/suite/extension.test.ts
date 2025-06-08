import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import * as extension from '../../extension';
import * as timerService from '../../services/timerService';
import * as statusService from '../../services/statusService';
import * as configService from '../../services/configService';

suite('Extension Test Suite', () => {
    let resetAllTimersStub: sinon.SinonStub;
    let showCurrentStatusStub: sinon.SinonStub;
    let clearAllTimersStub: sinon.SinonStub;
    let startTimersStub: sinon.SinonStub;
    let getTextsStub: sinon.SinonStub;
    let showInfoMessageStub: sinon.SinonStub;
    let registerCommandStub: sinon.SinonStub;
    let onDidChangeConfigurationStub: sinon.SinonStub;
    let mockContext: any;

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
            asAbsolutePath: (path: string) => path
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
