import * as vscode from 'vscode';
import { Config } from '../models/types';
import { languages } from '../utils/languages';
import { LanguageTexts } from '../models/types';

export function getConfig(): Config {
    const config = vscode.workspace.getConfiguration('healthReminder');
    return {
        sitInterval: config.get<number>('sitReminderInterval', 60),
        drinkInterval: config.get<number>('drinkReminderInterval', 45),
        enableSit: config.get<boolean>('enableSitReminder', true),
        enableDrink: config.get<boolean>('enableDrinkReminder', true),
        language: config.get<string>('language', 'zh-CN'),
    };
}

export function getTexts(): LanguageTexts {
    const config = getConfig();
    return languages[config.language] || languages['zh-CN'];
}
