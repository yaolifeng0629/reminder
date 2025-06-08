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
const statusService_1 = require("../../services/statusService");
const configService = __importStar(require("../../services/configService"));
const timerService = __importStar(require("../../services/timerService"));
const languages_1 = require("../../utils/languages");
suite('StatusService Test Suite', () => {
    let configStub;
    let getTextsStub;
    let showInfoMessageStub;
    let clock;
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
        getTextsStub.returns(languages_1.languages['zh-CN']);
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
        (0, statusService_1.showCurrentStatus)();
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
        (0, statusService_1.showCurrentStatus)();
        // 验证显示了禁用状态
        const expectedStatus = `📊 健康提醒状态\n\n🚶‍♂️ 久坐提醒: 已禁用\n💧 喝水提醒: 已禁用`;
        assert.strictEqual(showInfoMessageStub.calledOnce, true, 'Information message should be shown once');
        assert.strictEqual(showInfoMessageStub.firstCall.args[0], expectedStatus, 'Status message should show disabled state');
    });
    test('showCurrentStatus should show "coming soon" when time is up', () => {
        // 设置计时器状态为超过间隔时间
        timerService.timerState.sitStartTime = Date.now() - 65 * 60 * 1000; // 65分钟前
        timerService.timerState.drinkStartTime = Date.now() - 50 * 60 * 1000; // 50分钟前
        (0, statusService_1.showCurrentStatus)();
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
        getTextsStub.returns(languages_1.languages.en);
        (0, statusService_1.showCurrentStatus)();
        // 验证显示了英文状态
        const expectedStatus = `📊 Health Reminder Status\n\n🚶‍♂️ Sit Reminder: 45minutes until reminder\n💧 Drink Reminder: 15minutes until reminder`;
        assert.strictEqual(showInfoMessageStub.calledOnce, true, 'Information message should be shown once');
        assert.strictEqual(showInfoMessageStub.firstCall.args[0], expectedStatus, 'Status message should be in English');
    });
});
//# sourceMappingURL=statusService.test.js.map