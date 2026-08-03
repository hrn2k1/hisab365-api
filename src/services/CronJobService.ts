import cron from 'node-cron';
import Config from '../config/config';

class CronJobService {
  private isRunning = false;

  public start(): void {
    if (Config.CRON_ENABLED.toLowerCase() !== 'true') {
      console.log('[cron] Scheduler is disabled by CRON_ENABLED flag.');
      return;
    }

    const timezone = Config.CRON_TZ || 'UTC';
    const schedule = '0 * * * *';

    cron.schedule(schedule, async () => {
      if (this.isRunning) {
        console.log('[cron] Previous run is still active, skipping this cycle.');
        return;
      }

      const startedAt = Date.now();
      this.isRunning = true;

      try {
        console.log(`[cron] Hourly job started at ${new Date().toISOString()}`);
        await this.runHourlyJob();
        const durationMs = Date.now() - startedAt;
        console.log(`[cron] Hourly job completed in ${durationMs}ms`);
      } catch (error) {
        console.error('[cron] Hourly job failed:', error);
      } finally {
        this.isRunning = false;
      }
    }, { timezone });

    console.log(`[cron] Registered hourly schedule '${schedule}' with timezone '${timezone}'.`);
  }

  private async runHourlyJob(): Promise<void> {
    // TODO: Implement hourly business logic here.
  }
}

export default new CronJobService();
