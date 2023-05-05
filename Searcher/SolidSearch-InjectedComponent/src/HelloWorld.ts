import { getLoggerFor, Initializer } from '@solid/community-server';

/**
 * An {@link Initializer} that logs an informative message during startup.
 */
export class HelloWorld extends Initializer {
  protected readonly logger = getLoggerFor(this);

  public async handle(input: void): Promise<void> {
    this.logger.info('HELLO WORLD!');
  }
}
