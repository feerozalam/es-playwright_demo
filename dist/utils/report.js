"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportGenerator = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
class ReportGenerator {
    static async captureScreenshot(scenario) {
        try {
            const { page } = scenario;
            if (page) {
                if (!(0, fs_1.existsSync)(this.reportsDir)) {
                    (0, fs_1.mkdirSync)(this.reportsDir, { recursive: true });
                }
                const screenshot = await page.screenshot({
                    path: (0, path_1.join)(this.reportsDir, `${scenario.pickle.name.replace(/\s+/g, '_')}.png`),
                    fullPage: true
                });
                return screenshot;
            }
        }
        catch (error) {
            console.error('Failed to capture screenshot:', error);
        }
    }
    static saveReport(data) {
        if (!(0, fs_1.existsSync)(this.reportsDir)) {
            (0, fs_1.mkdirSync)(this.reportsDir, { recursive: true });
        }
        (0, fs_1.writeFileSync)((0, path_1.join)(this.reportsDir, 'test-report.json'), JSON.stringify(data, null, 2));
    }
}
exports.ReportGenerator = ReportGenerator;
ReportGenerator.reportsDir = (0, path_1.join)(process.cwd(), 'reports');
