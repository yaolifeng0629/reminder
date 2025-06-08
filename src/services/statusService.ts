import * as vscode from 'vscode';
import { getConfig, getTexts } from './configService';
import { timerState } from './timerService';

export function showCurrentStatus(): void {
    const config = getConfig();
    const texts = getTexts();
    const now = Date.now();

    let status = `${texts.statusTitle}\n\n`;

    if (config.enableSit) {
        const sitElapsed = Math.floor((now - timerState.sitStartTime) / 1000 / 60);
        const sitRemaining = config.sitInterval - sitElapsed;
        status += `${texts.sitStatus}: ${
            sitRemaining > 0 ? `${sitRemaining}${texts.minutesLater}` : texts.comingSoon
        }\n`;
    } else {
        status += `${texts.sitStatus}: ${texts.disabled}\n`;
    }

    if (config.enableDrink) {
        const drinkElapsed = Math.floor((now - timerState.drinkStartTime) / 1000 / 60);
        const drinkRemaining = config.drinkInterval - drinkElapsed;
        status += `${texts.drinkStatus}: ${
            drinkRemaining > 0 ? `${drinkRemaining}${texts.minutesLater}` : texts.comingSoon
        }`;
    } else {
        status += `${texts.drinkStatus}: ${texts.disabled}`;
    }

    vscode.window.showInformationMessage(status);
}
