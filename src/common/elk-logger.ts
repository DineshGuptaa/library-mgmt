import { ConsoleLogger } from '@nestjs/common';
import net from 'net';

export class ElkLogger extends ConsoleLogger {
  private client: net.Socket | null = null;
  private host: string;
  private port: number;

  constructor(host = 'localhost', port = 5000) {
    super();
    this.host = process.env.LOGSTASH_HOST || host;
    this.port = Number(process.env.LOGSTASH_PORT) || port;
  }

  private send(level: string, message: any, context?: string) {
    try {
      const payload = JSON.stringify({
        timestamp: new Date().toISOString(),
        level,
        context,
        message: typeof message === 'string' ? message : JSON.stringify(message),
        environment: process.env.ENV || 'development',
        service: 'library-management',
      });

      if (!this.client) {
        this.client = net.createConnection(
          { host: this.host, port: this.port },
          () => this.client!.write(payload + '\n'),
        );
        this.client.on('error', () => {
          this.client?.destroy();
          this.client = null;
        });
        this.client.on('close', () => {
          this.client = null;
        });
      } else {
        this.client.write(payload + '\n');
      }
    } catch {
      // silently fail — don't let logging break the app
    }
  }

  log(message: any, context?: string) {
    super.log(message, context);
    this.send('info', message, context);
  }

  error(message: any, stack?: string, context?: string) {
    super.error(message, stack, context);
    this.send('error', message, context);
  }

  warn(message: any, context?: string) {
    super.warn(message, context);
    this.send('warn', message, context);
  }

  debug(message: any, context?: string) {
    super.debug(message, context);
    this.send('debug', message, context);
  }

  verbose(message: any, context?: string) {
    super.verbose(message, context);
    this.send('verbose', message, context);
  }
}
