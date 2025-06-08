import * as assert from 'assert';
import * as sinon from 'sinon';
import { timerState, startTimers, clearAllTimers, resetAllTimers, resetSitTimer, resetDrinkTimer } from '../../services/timerService';
import * as configService from '../../services/configService';
import * as reminderUI from '../../ui/reminderUI';

suite('TimerService Test Suite', () => {
    let configStub: sinon.SinonStub;
    let showSitReminderStub: sinon.SinonStub;
    let showDrinkReminderStub: sinon.SinonStub;
    let clock: sinon.SinonFakeTimers;

    setup(() => {
        // 创建假时钟
        clock = sinon.useFakeTimers();

        // 存根配置服务
        configStub = sinon.stub(configService, 'getConfig');
        configStub.returns({
            sitInterval: 60,
            drinkInterval: 45,
            enableSit: true,
            enableDrink: true,
            language: 'zh-CN'
        });

        // 存根提醒UI
        showSitReminderStub = sinon.stub(reminderUI, 'showSitReminder').resolves();
        showDrinkReminderStub = sinon.stub(reminderUI, 'showDrinkReminder').resolves();

        // 重置计时器状态
        timerState.sitTimer = null;
        timerState.drinkTimer = null;
        timerState.sitStartTime = Date.now();
        timerState.drinkStartTime = Date.now();
    });

    teardown(() => {
        // 恢复所有存根
        configStub.restore();
        showSitReminderStub.restore();
        showDrinkReminderStub.restore();
        clock.restore();
    });

    test('startTimers should set up timers based on configuration', () => {
        startTimers();

        assert.notStrictEqual(timerState.sitTimer, null, 'Sit timer should be initialized');
        assert.notStrictEqual(timerState.drinkTimer, null, 'Drink timer should be initialized');

        // 前进60分钟，触发久坐提醒
        clock.tick(60 * 60 * 1000);
        assert.strictEqual(showSitReminderStub.calledOnce, true, 'Sit reminder should be called after 60 minutes');

        // 再前进15分钟（总共75分钟），确保喝水提醒也被触发
        clock.tick(15 * 60 * 1000);
        assert.strictEqual(showDrinkReminderStub.calledOnce, true, 'Drink reminder should be called after 45 minutes');
    });

    test('clearAllTimers should clear all timers', () => {
        startTimers();

        // 确保计时器已设置
        assert.notStrictEqual(timerState.sitTimer, null);
        assert.notStrictEqual(timerState.drinkTimer, null);

        clearAllTimers();

        // 确保计时器已清除
        assert.strictEqual(timerState.sitTimer, null, 'Sit timer should be cleared');
        assert.strictEqual(timerState.drinkTimer, null, 'Drink timer should be cleared');

        // 前进很长时间，确保没有提醒被触发
        clock.tick(120 * 60 * 1000);
        assert.strictEqual(showSitReminderStub.notCalled, true, 'Sit reminder should not be called after clearing timers');
        assert.strictEqual(showDrinkReminderStub.notCalled, true, 'Drink reminder should not be called after clearing timers');
    });

    test('resetAllTimers should clear and restart all timers', () => {
        startTimers();

        // 记录原始计时器
        const originalSitTimer = timerState.sitTimer;
        const originalDrinkTimer = timerState.drinkTimer;

        resetAllTimers();

        // 确保计时器已重置（不同的计时器ID）
        assert.notStrictEqual(timerState.sitTimer, null, 'Sit timer should be initialized after reset');
        assert.notStrictEqual(timerState.drinkTimer, null, 'Drink timer should be initialized after reset');
        assert.notStrictEqual(timerState.sitTimer, originalSitTimer, 'Sit timer should be different after reset');
        assert.notStrictEqual(timerState.drinkTimer, originalDrinkTimer, 'Drink timer should be different after reset');
    });

    test('resetSitTimer should only reset the sit timer', () => {
        startTimers();

        // 记录原始计时器
        const originalSitTimer = timerState.sitTimer;
        const originalDrinkTimer = timerState.drinkTimer;

        resetSitTimer();

        // 确保只有久坐计时器被重置
        assert.notStrictEqual(timerState.sitTimer, originalSitTimer, 'Sit timer should be different after reset');
        assert.strictEqual(timerState.drinkTimer, originalDrinkTimer, 'Drink timer should remain the same');
    });

    test('resetDrinkTimer should only reset the drink timer', () => {
        startTimers();

        // 记录原始计时器
        const originalSitTimer = timerState.sitTimer;
        const originalDrinkTimer = timerState.drinkTimer;

        resetDrinkTimer();

        // 确保只有喝水计时器被重置
        assert.strictEqual(timerState.sitTimer, originalSitTimer, 'Sit timer should remain the same');
        assert.notStrictEqual(timerState.drinkTimer, originalDrinkTimer, 'Drink timer should be different after reset');
    });

    test('timers should not be created when disabled in config', () => {
        // 修改配置，禁用计时器
        configStub.restore();
        configStub = sinon.stub(configService, 'getConfig');
        configStub.returns({
            sitInterval: 60,
            drinkInterval: 45,
            enableSit: false,
            enableDrink: false,
            language: 'zh-CN'
        });

        startTimers();

        // 确保计时器未创建
        assert.strictEqual(timerState.sitTimer, null, 'Sit timer should not be created when disabled');
        assert.strictEqual(timerState.drinkTimer, null, 'Drink timer should not be created when disabled');

        // 前进很长时间，确保没有提醒被触发
        clock.tick(120 * 60 * 1000);
        assert.strictEqual(showSitReminderStub.notCalled, true, 'Sit reminder should not be called when disabled');
        assert.strictEqual(showDrinkReminderStub.notCalled, true, 'Drink reminder should not be called when disabled');
    });
});
