declare module 'node-cron' {
  export interface ScheduleOptions {
    timezone?: string;
  }

  export type Task = {
    stop(): void;
    start(): void;
    destroy(): void;
  };

  export function schedule(
    expression: string,
    func: () => void | Promise<void>,
    options?: ScheduleOptions
  ): Task;

  const cron: {
    schedule: typeof schedule;
  };

  export default cron;
}