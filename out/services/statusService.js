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
exports.showCurrentStatus = showCurrentStatus;
const vscode = __importStar(require("vscode"));
const configService_1 = require("./configService");
const timerService_1 = require("./timerService");
function showCurrentStatus() {
    const config = (0, configService_1.getConfig)();
    const texts = (0, configService_1.getTexts)();
    const now = Date.now();
    let status = `${texts.statusTitle}\n\n`;
    if (config.enableSit) {
        const sitElapsed = Math.floor((now - timerService_1.timerState.sitStartTime) / 1000 / 60);
        const sitRemaining = config.sitInterval - sitElapsed;
        status += `${texts.sitStatus}: ${sitRemaining > 0 ? `${sitRemaining}${texts.minutesLater}` : texts.comingSoon}\n`;
    }
    else {
        status += `${texts.sitStatus}: ${texts.disabled}\n`;
    }
    if (config.enableDrink) {
        const drinkElapsed = Math.floor((now - timerService_1.timerState.drinkStartTime) / 1000 / 60);
        const drinkRemaining = config.drinkInterval - drinkElapsed;
        status += `${texts.drinkStatus}: ${drinkRemaining > 0 ? `${drinkRemaining}${texts.minutesLater}` : texts.comingSoon}`;
    }
    else {
        status += `${texts.drinkStatus}: ${texts.disabled}`;
    }
    vscode.window.showInformationMessage(status);
}
//# sourceMappingURL=statusService.js.map