import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class HttpLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction) {
    const startedAt = Date.now();

    response.once('finish', () => {
      const durationMs = Date.now() - startedAt;
      const method = request.method;
      const url = request.originalUrl || request.url;
      const statusCode = response.statusCode;

      this.logger.log(`${method} ${url} -> ${statusCode} ${durationMs}ms`);
    });

    next();
  }
}
