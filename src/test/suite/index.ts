import * as path from 'path';
import * as Mocha from 'mocha';
import { glob } from 'glob';
import * as fs from 'fs';

export function run(): Promise<void> {
    // 创建 mocha 测试
    const mocha = new (Mocha as any)({
        ui: 'tdd',
        color: true
    });

    const testsRoot = path.resolve(__dirname, '..');

    return new Promise((c, e) => {
        glob('**/**.test.js', { cwd: testsRoot })
            .then(files => {
                // 添加文件到测试套件
                files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

                try {
                    // 运行测试
                    mocha.run(failures => {
                        if (failures > 0) {
                            e(new Error(`${failures} tests failed.`));
                        } else {
                            c();
                        }
                    });
                } catch (err) {
                    e(err);
                }
            })
            .catch(err => {
                e(err);
            });
    });
}
