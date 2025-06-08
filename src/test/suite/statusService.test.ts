import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { showCurrentStatus } from '../../services/statusService';
import * as configService from '../../services/configService';
import * as timerService from '../../services/timerService';
import { languages } from '../../utils/languages';

suite('StatusService Test Suite', () => {
    let configStub: sinon.SinonStub;
    let getTextsStub: sinon.SinonStub;
    let showInfoMessageStub: sinon.SinonStub;
    let clock: sinon.SinonFakeTimers;

    setup(() => {
        // 创建假时钟
        clock = sinon.useFakeTimers(new Date('2023-01-01T12:00:00').getTime());

        // 存根配置服务
        configStub = sinon.stub(configService, 'getConfig');
        configStub.returns({
            sitInterval: 60,
            drinkInterval: 45,
            enableSit: true,
            enableDrink: true,
            language: 'zh-CN'
        });

        // 存根文本服务
        getTextsStub = sinon.stub(configService, 'getTexts');
        getTextsStub.returns(languages['zh-CN']);

        // 存根 VS Code 信息消息
        showInfoMessageStub = sinon.stub(vscode.window, 'showInformationMessage');

        // 设置计时器状态
        timerService.timerState.sitStartTime = Date.now() - 15 * 60 * 1000; // 15分钟前
        timerService.timerState.drinkStartTime = Date.now() - 30 * 60 * 1000; // 30分钟前
    });

    teardown(() => {
        // 恢复所有存根
        configStub.restore();
        getTextsStub.restore();
        showInfoMessageStub.restore();
        clock.restore();
    });

    test('showCurrentStatus should display correct status message', () => {
        showCurrentStatus();

        // 验证显示了正确的状态信息
        const expectedStatus = `📊 健康提醒状态\n\n🚶‍♂️ 久坐提醒: 45分钟后提醒\n💧 喝水提醒: 15分钟后提醒`;
        assert.strictEqual(showInfoMessageStub.calledOnce, true, 'Information message should be shown once');
        assert.strictEqual(showInfoMessageStub.firstCall.args[0], expectedStatus, 'Status message should match expected format');
    });

    test('showCurrentStatus should handle disabled reminders', () => {
        // 修改配置，禁用提醒
        configStub.restore();
        configStub = sinon.stub(configService, 'getConfig');
        configStub.returns({
            sitInterval: 60,
            drinkInterval: 45,
            enableSit: false,
            enableDrink: false,
            language: 'zh-CN'
        });

        showCurrentStatus();

        // 验证显示了禁用状态
        const expectedStatus = `📊 健康提醒状态\n\n🚶‍♂️ 久坐提醒: 已禁用\n💧 喝水提醒: 已禁用`;
        assert.strictEqual(showInfoMessageStub.calledOnce, true, 'Information message should be shown once');
        assert.strictEqual(showInfoMessageStub.firstCall.args[0], expectedStatus, 'Status message should show disabled state');
    });

    test('showCurrentStatus should show "coming soon" when time is up', () => {
        // 设置计时器状态为超过间隔时间
        timerService.timerState.sitStartTime = Date.now() - 65 * 60 * 1000; // 65分钟前
        timerService.timerState.drinkStartTime = Date.now() - 50 * 60 * 1000; // 50分钟前

        showCurrentStatus();

        // 验证显示了即将提醒状态
        const expectedStatus = `📊 健康提醒状态\n\n🚶‍♂️ 久坐提醒: 即将提醒\n💧 喝水提醒: 即将提醒`;
        assert.strictEqual(showInfoMessageStub.calledOnce, true, 'Information message should be shown once');
        assert.strictEqual(showInfoMessageStub.firstCall.args[0], expectedStatus, 'Status message should show coming soon state');
    });

    test('showCurrentStatus should use English texts when language is set to en', () => {
        // 修改配置，使用英文
        configStub.restore();
        configStub = sinon.stub(configService, 'getConfig');
        configStub.returns({
            sitInterval: 60,
            drinkInterval: 45,
            enableSit: true,
            enableDrink: true,
            language: 'en'
        });

        // 更新文本存根
        getTextsStub.restore();
        getTextsStub = sinon.stub(configService, 'getTexts');
        getTextsStub.returns(languages.en);

        showCurrentStatus();

        // 验证显示了英文状态
        const expectedStatus = `📊 Health Reminder Status\n\n🚶‍♂️ Sit Reminder: 45minutes until reminder\n💧 Drink Reminder: 15minutes until reminder`;
        assert.strictEqual(showInfoMessageStub.calledOnce, true, 'Information message should be shown once');
        assert.strictEqual(showInfoMessageStub.firstCall.args[0], expectedStatus, 'Status message should be in English');
    });
});
