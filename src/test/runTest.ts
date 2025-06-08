import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main() {
    try {
        // 测试插件的根目录
        const extensionDevelopmentPath = path.resolve(__dirname, '../../');

        // 测试脚本的路径
        const extensionTestsPath = path.resolve(__dirname, './suite/index');

        // 下载 VS Code, 解压, 启动并运行测试
        await runTests({
            extensionDevelopmentPath,
            extensionTestsPath
        });
    } catch (err) {
        console.error('Failed to run tests', err);
        process.exit(1);
    }
}

main();
