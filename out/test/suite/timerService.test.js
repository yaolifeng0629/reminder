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
const timerService_1 = require("../../services/timerService");
const configService = __importStar(require("../../services/configService"));
const reminderUI = __importStar(require("../../ui/reminderUI"));
suite('TimerService Test Suite', () => {
    let configStub;
    let showSitReminderStub;
    let showDrinkReminderStub;
    let clock;
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
        timerService_1.timerState.sitTimer = null;
        timerService_1.timerState.drinkTimer = null;
        timerService_1.timerState.sitStartTime = Date.now();
        timerService_1.timerState.drinkStartTime = Date.now();
    });
    teardown(() => {
        // 恢复所有存根
        configStub.restore();
        showSitReminderStub.restore();
        showDrinkReminderStub.restore();
        clock.restore();
    });
    test('startTimers should set up timers based on configuration', () => {
        (0, timerService_1.startTimers)();
        assert.notStrictEqual(timerService_1.timerState.sitTimer, null, 'Sit timer should be initialized');
        assert.notStrictEqual(timerService_1.timerState.drinkTimer, null, 'Drink timer should be initialized');
        // 前进60分钟，触发久坐提醒
        clock.tick(60 * 60 * 1000);
        assert.strictEqual(showSitReminderStub.calledOnce, true, 'Sit reminder should be called after 60 minutes');
        // 再前进15分钟（总共75分钟），确保喝水提醒也被触发
        clock.tick(15 * 60 * 1000);
        assert.strictEqual(showDrinkReminderStub.calledOnce, true, 'Drink reminder should be called after 45 minutes');
    });
    test('clearAllTimers should clear all timers', () => {
        (0, timerService_1.startTimers)();
        // 确保计时器已设置
        assert.notStrictEqual(timerService_1.timerState.sitTimer, null);
        assert.notStrictEqual(timerService_1.timerState.drinkTimer, null);
        (0, timerService_1.clearAllTimers)();
        // 确保计时器已清除
        assert.strictEqual(timerService_1.timerState.sitTimer, null, 'Sit timer should be cleared');
        assert.strictEqual(timerService_1.timerState.drinkTimer, null, 'Drink timer should be cleared');
        // 前进很长时间，确保没有提醒被触发
        clock.tick(120 * 60 * 1000);
        assert.strictEqual(showSitReminderStub.notCalled, true, 'Sit reminder should not be called after clearing timers');
        assert.strictEqual(showDrinkReminderStub.notCalled, true, 'Drink reminder should not be called after clearing timers');
    });
    test('resetAllTimers should clear and restart all timers', () => {
        (0, timerService_1.startTimers)();
        // 记录原始计时器
        const originalSitTimer = timerService_1.timerState.sitTimer;
        const originalDrinkTimer = timerService_1.timerState.drinkTimer;
        (0, timerService_1.resetAllTimers)();
        // 确保计时器已重置（不同的计时器ID）
        assert.notStrictEqual(timerService_1.timerState.sitTimer, null, 'Sit timer should be initialized after reset');
        assert.notStrictEqual(timerService_1.timerState.drinkTimer, null, 'Drink timer should be initialized after reset');
        assert.notStrictEqual(timerService_1.timerState.sitTimer, originalSitTimer, 'Sit timer should be different after reset');
        assert.notStrictEqual(timerService_1.timerState.drinkTimer, originalDrinkTimer, 'Drink timer should be different after reset');
    });
    test('resetSitTimer should only reset the sit timer', () => {
        (0, timerService_1.startTimers)();
        // 记录原始计时器
        const originalSitTimer = timerService_1.timerState.sitTimer;
        const originalDrinkTimer = timerService_1.timerState.drinkTimer;
        (0, timerService_1.resetSitTimer)();
        // 确保只有久坐计时器被重置
        assert.notStrictEqual(timerService_1.timerState.sitTimer, originalSitTimer, 'Sit timer should be different after reset');
        assert.strictEqual(timerService_1.timerState.drinkTimer, originalDrinkTimer, 'Drink timer should remain the same');
    });
    test('resetDrinkTimer should only reset the drink timer', () => {
        (0, timerService_1.startTimers)();
        // 记录原始计时器
        const originalSitTimer = timerService_1.timerState.sitTimer;
        const originalDrinkTimer = timerService_1.timerState.drinkTimer;
        (0, timerService_1.resetDrinkTimer)();
        // 确保只有喝水计时器被重置
        assert.strictEqual(timerService_1.timerState.sitTimer, originalSitTimer, 'Sit timer should remain the same');
        assert.notStrictEqual(timerService_1.timerState.drinkTimer, originalDrinkTimer, 'Drink timer should be different after reset');
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
        (0, timerService_1.startTimers)();
        // 确保计时器未创建
        assert.strictEqual(timerService_1.timerState.sitTimer, null, 'Sit timer should not be created when disabled');
        assert.strictEqual(timerService_1.timerState.drinkTimer, null, 'Drink timer should not be created when disabled');
        // 前进很长时间，确保没有提醒被触发
        clock.tick(120 * 60 * 1000);
        assert.strictEqual(showSitReminderStub.notCalled, true, 'Sit reminder should not be called when disabled');
        assert.strictEqual(showDrinkReminderStub.notCalled, true, 'Drink reminder should not be called when disabled');
    });
});
//# sourceMappingURL=timerService.test.js.map