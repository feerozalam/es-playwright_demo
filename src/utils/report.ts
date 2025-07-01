import { ITestCaseHookParameter } from '@cucumber/cucumber';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export class ReportGenerator {
  private static reportsDir = join(process.cwd(), 'reports');
  
  /**
   * Capture screenshot for embedding in report
   * @param page - Playwright page object
   * @returns Promise<Buffer | undefined> - Screenshot buffer
   */
  static async captureScreenshot(page: any): Promise<Buffer | undefined> {
    try {
      if (page) {
        console.log('📸 Taking screenshot...');
        
        // Capture screenshot as buffer for embedding in report
        const screenshotBuffer = await page.screenshot({
          fullPage: true,
          type: 'png'
        });

        console.log('� Screenshot captured successfully');
        return screenshotBuffer;
      }
    } catch (error) {
      console.error('❌ Failed to capture screenshot:', error);
      throw error;
    }
  }

  /**
   * Save screenshot to file system for backup
   * @param scenarioName - Name of the scenario
   * @param screenshotBuffer - Screenshot buffer
   */
  static async saveScreenshotToFile(scenarioName: string, screenshotBuffer: Buffer) {
    try {
      if (!existsSync(this.reportsDir)) {
        mkdirSync(this.reportsDir, { recursive: true });
      }

      const fileName = `${scenarioName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`;
      const filePath = join(this.reportsDir, fileName);
      
      writeFileSync(filePath, screenshotBuffer);
      console.log(`💾 Screenshot also saved to: ${filePath}`);
    } catch (error) {
      console.warn('⚠️ Failed to save screenshot to file:', error);
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
