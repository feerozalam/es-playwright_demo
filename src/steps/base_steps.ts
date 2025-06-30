import { logger } from '../utils/logger';

export class BaseSteps {
    protected validatePageContext(page: any): void {
        if (!page) {
            const error = 'Page not available in test context';
            logger.error(error);
            throw new Error(error);
        }
    }

    protected async handleStepError(stepName: string, error: unknown): Promise<never> {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Step '${stepName}' failed: ${errorMessage}`, error);
        throw error;
    }

    protected logStepSuccess(stepName: string, details?: string): void {
        const message = details ? `${stepName}: ${details}` : stepName;
        logger.info(`✓ ${message}`);
    }
}