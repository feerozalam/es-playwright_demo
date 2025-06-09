import { ITestCaseHookParameter } from '@cucumber/cucumber';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export class ReportGenerator {
  private static reportsDir = join(process.cwd(), 'reports');
  static async captureScreenshot(scenario: ITestCaseHookParameter & { [key: string]: any }) {
    try {
      const { page } = scenario;
      if (page) {
        if (!existsSync(this.reportsDir)) {
          mkdirSync(this.reportsDir, { recursive: true });
        }

        const screenshot = await page.screenshot({
          path: join(this.reportsDir, `${scenario.pickle.name.replace(/\s+/g, '_')}.png`),
          fullPage: true
        });

        return screenshot;
      }
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
    }
  }

  static saveReport(data: any) {
    if (!existsSync(this.reportsDir)) {
      mkdirSync(this.reportsDir, { recursive: true });
    }

    writeFileSync(
      join(this.reportsDir, 'test-report.json'),
      JSON.stringify(data, null, 2)
    );
  }
}
