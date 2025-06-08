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
const vscode = __importStar(require("vscode"));
const sinon = __importStar(require("sinon"));
const configService_1 = require("../../services/configService");
const languages_1 = require("../../utils/languages");
suite('ConfigService Test Suite', () => {
    let configStub;
    setup(() => {
        // 创建配置的存根
        configStub = sinon.stub(vscode.workspace, 'getConfiguration');
        configStub.returns({
            get: (key, defaultValue) => {
                const configMap = {
                    'sitReminderInterval': 45,
                    'drinkReminderInterval': 30,
                    'enableSitReminder': true,
                    'enableDrinkReminder': false,
                    'language': 'en'
                };
                return configMap[key] !== undefined ? configMap[key] : defaultValue;
            }
        });
    });
    teardown(() => {
        // 恢复存根
        configStub.restore();
    });
    test('getConfig should return correct configuration values', () => {
        const config = (0, configService_1.getConfig)();
        assert.strictEqual(config.sitInterval, 45);
        assert.strictEqual(config.drinkInterval, 30);
        assert.strictEqual(config.enableSit, true);
        assert.strictEqual(config.enableDrink, false);
        assert.strictEqual(config.language, 'en');
    });
    test('getTexts should return English texts when language is set to en', () => {
        const texts = (0, configService_1.getTexts)();
        assert.strictEqual(texts, languages_1.languages.en);
        assert.strictEqual(texts.sitReminderTitle, '🚶‍♂️ Time to Stand Up!');
    });
    test('getTexts should return Chinese texts when language is set to zh-CN', () => {
        // 修改语言配置
        configStub.restore();
        configStub = sinon.stub(vscode.workspace, 'getConfiguration');
        configStub.returns({
            get: (key, defaultValue) => {
                const configMap = {
                    'language': 'zh-CN'
                };
                return configMap[key] !== undefined ? configMap[key] : defaultValue;
            }
        });
        const texts = (0, configService_1.getTexts)();
        assert.strictEqual(texts, languages_1.languages['zh-CN']);
        assert.strictEqual(texts.sitReminderTitle, '🚶‍♂️ 该起身活动了！');
    });
    test('getTexts should return Chinese texts as fallback for unknown language', () => {
        // 修改语言配置为不存在的语言
        configStub.restore();
        configStub = sinon.stub(vscode.workspace, 'getConfiguration');
        configStub.returns({
            get: (key, defaultValue) => {
                const configMap = {
                    'language': 'fr' // 不支持的语言
                };
                return configMap[key] !== undefined ? configMap[key] : defaultValue;
            }
        });
        const texts = (0, configService_1.getTexts)();
        assert.strictEqual(texts, languages_1.languages['zh-CN']);
        assert.strictEqual(texts.sitReminderTitle, '🚶‍♂️ 该起身活动了！');
    });
});
//# sourceMappingURL=configService.test.js.map