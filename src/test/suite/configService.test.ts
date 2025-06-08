import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { getConfig, getTexts } from '../../services/configService';
import { languages } from '../../utils/languages';

suite('ConfigService Test Suite', () => {
    let configStub: sinon.SinonStub;

    setup(() => {
        // 创建配置的存根
        configStub = sinon.stub(vscode.workspace, 'getConfiguration');
        configStub.returns({
            get: (key: string, defaultValue: any) => {
                const configMap: { [key: string]: any } = {
                    'sitReminderInterval': 45,
                    'drinkReminderInterval': 30,
                    'enableSitReminder': true,
                    'enableDrinkReminder': false,
                    'language': 'en'
                };
                return configMap[key] !== undefined ? configMap[key] : defaultValue;
            }
        } as any);
    });

    teardown(() => {
        // 恢复存根
        configStub.restore();
    });

    test('getConfig should return correct configuration values', () => {
        const config = getConfig();
        assert.strictEqual(config.sitInterval, 45);
        assert.strictEqual(config.drinkInterval, 30);
        assert.strictEqual(config.enableSit, true);
        assert.strictEqual(config.enableDrink, false);
        assert.strictEqual(config.language, 'en');
    });

    test('getTexts should return English texts when language is set to en', () => {
        const texts = getTexts();
        assert.strictEqual(texts, languages.en);
        assert.strictEqual(texts.sitReminderTitle, '🚶‍♂️ Time to Stand Up!');
    });

    test('getTexts should return Chinese texts when language is set to zh-CN', () => {
        // 修改语言配置
        configStub.restore();
        configStub = sinon.stub(vscode.workspace, 'getConfiguration');
        configStub.returns({
            get: (key: string, defaultValue: any) => {
                const configMap: { [key: string]: any } = {
                    'language': 'zh-CN'
                };
                return configMap[key] !== undefined ? configMap[key] : defaultValue;
            }
        } as any);

        const texts = getTexts();
        assert.strictEqual(texts, languages['zh-CN']);
        assert.strictEqual(texts.sitReminderTitle, '🚶‍♂️ 该起身活动了！');
    });

    test('getTexts should return Chinese texts as fallback for unknown language', () => {
        // 修改语言配置为不存在的语言
        configStub.restore();
        configStub = sinon.stub(vscode.workspace, 'getConfiguration');
        configStub.returns({
            get: (key: string, defaultValue: any) => {
                const configMap: { [key: string]: any } = {
                    'language': 'fr' // 不支持的语言
                };
                return configMap[key] !== undefined ? configMap[key] : defaultValue;
            }
        } as any);

        const texts = getTexts();
        assert.strictEqual(texts, languages['zh-CN']);
        assert.strictEqual(texts.sitReminderTitle, '🚶‍♂️ 该起身活动了！');
    });
});
