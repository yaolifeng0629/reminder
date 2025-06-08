import * as vscode from 'vscode';

export interface TimerState {
    sitTimer: NodeJS.Timeout | null;
    drinkTimer: NodeJS.Timeout | null;
    sitStartTime: number;
    drinkStartTime: number;
}

export interface LanguageTexts {
    sitReminderTitle: string;
    sitReminderMessage: string;
    sitReminderButton: string;
    drinkReminderTitle: string;
    drinkReminderMessage: string;
    drinkReminderButton: string;
    confirmMessage: string;
    resetMessage: string;
    statusTitle: string;
    sitStatus: string;
    drinkStatus: string;
    disabled: string;
    minutesLater: string;
    comingSoon: string;
    waitSeconds: string;
}

export interface Config {
    sitInterval: number;
    drinkInterval: number;
    enableSit: boolean;
    enableDrink: boolean;
    language: string;
}
