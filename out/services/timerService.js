"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timerState = void 0;
exports.setSitReminderFunction = setSitReminderFunction;
exports.setDrinkReminderFunction = setDrinkReminderFunction;
exports.startTimers = startTimers;
exports.restartTimers = restartTimers;
exports.clearAllTimers = clearAllTimers;
exports.resetAllTimers = resetAllTimers;
exports.resetSitTimer = resetSitTimer;
exports.resetDrinkTimer = resetDrinkTimer;
const configService_1 = require("./configService");
/**
 * 提醒函数引用
 * 这种设计模式避免了循环依赖问题
 * 允许UI模块和服务模块之间相互调用而不产生导入循环
 */
let sitReminderFunction = () => { };
let drinkReminderFunction = () => { };
/**
 * 设置久坐提醒函数
 * 由UI模块调用，注册显示久坐提醒的函数
 * 这是依赖注入的一种形式，使timerService可以触发UI操作而不直接依赖UI模块
 *
 * @param fn 提醒函数
 */
function setSitReminderFunction(fn) {
    sitReminderFunction = fn;
}
/**
 * 设置喝水提醒函数
 * 由UI模块调用，注册显示喝水提醒的函数
 *
 * @param fn 提醒函数
 */
function setDrinkReminderFunction(fn) {
    drinkReminderFunction = fn;
}
/**
 * 计时器状态
 * 存储当前活跃的计时器和开始时间
 * 用于跟踪计时器状态和计算剩余时间
 */
exports.timerState = {
    sitTimer: null,
    drinkTimer: null,
    sitStartTime: Date.now(),
    drinkStartTime: Date.now(),
};
/**
 * 启动所有计时器
 * 根据配置启动久坐和喝水提醒计时器
 * 在插件激活时和配置变更时调用
 */
function startTimers() {
    const config = (0, configService_1.getConfig)();
    startSitTimer(config.sitInterval, config.enableSit);
    startDrinkTimer(config.drinkInterval, config.enableDrink);
}
/**
 * 启动久坐提醒计时器
 * 根据配置的时间间隔设置计时器
 * 计时器到期时会调用注册的提醒函数
 *
 * @param interval 时间间隔（分钟）
 * @param enabled 是否启用
 */
function startSitTimer(interval, enabled) {
    if (!enabled)
        return;
    exports.timerState.sitTimer = setTimeout(() => {
        sitReminderFunction();
    }, interval * 60 * 1000);
    exports.timerState.sitStartTime = Date.now();
}
/**
 * 启动喝水提醒计时器
 * 根据配置的时间间隔设置计时器
 * 计时器到期时会调用注册的提醒函数
 *
 * @param interval 时间间隔（分钟）
 * @param enabled 是否启用
 */
function startDrinkTimer(interval, enabled) {
    if (!enabled)
        return;
    exports.timerState.drinkTimer = setTimeout(() => {
        drinkReminderFunction();
    }, interval * 60 * 1000);
    exports.timerState.drinkStartTime = Date.now();
}
/**
 * 重启所有计时器
 * 清除现有计时器并重新启动
 */
function restartTimers() {
    clearAllTimers();
    startTimers();
}
/**
 * 清除所有计时器
 * 停止所有活跃的计时器
 * 在插件停用或重置计时器时调用
 */
function clearAllTimers() {
    clearSitTimer();
    clearDrinkTimer();
}
/**
 * 清除久坐计时器
 * 停止久坐提醒计时器
 */
function clearSitTimer() {
    if (exports.timerState.sitTimer) {
        clearTimeout(exports.timerState.sitTimer);
        exports.timerState.sitTimer = null;
    }
}
/**
 * 清除喝水计时器
 * 停止喝水提醒计时器
 */
function clearDrinkTimer() {
    if (exports.timerState.drinkTimer) {
        clearTimeout(exports.timerState.drinkTimer);
        exports.timerState.drinkTimer = null;
    }
}
/**
 * 重置所有计时器
 * 清除并重新启动所有计时器
 * 在配置变更或用户手动重置时调用
 */
function resetAllTimers() {
    clearAllTimers();
    startTimers();
}
/**
 * 重置久坐计时器
 * 当用户确认久坐提醒后调用
 * 清除现有计时器并根据最新配置重新启动
 */
function resetSitTimer() {
    const config = (0, configService_1.getConfig)();
    // 清除现有计时器
    clearSitTimer();
    // 重新启动计时器（使用最新配置）
    if (config.enableSit) {
        startSitTimer(config.sitInterval, true);
    }
}
/**
 * 重置喝水计时器
 * 当用户确认喝水提醒后调用
 * 清除现有计时器并根据最新配置重新启动
 */
function resetDrinkTimer() {
    const config = (0, configService_1.getConfig)();
    // 清除现有计时器
    clearDrinkTimer();
    // 重新启动计时器（使用最新配置）
    if (config.enableDrink) {
        startDrinkTimer(config.drinkInterval, true);
    }
}
//# sourceMappingURL=timerService.js.map