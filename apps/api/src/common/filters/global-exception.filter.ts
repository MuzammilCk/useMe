import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ZodError } from 'zod';
import type { ApiResponse } from '@fitness/types';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let field: string | undefined;

    // --- Zod validation errors (thrown directly or via nestjs-zod) ---
    if (exception instanceof ZodError) {
      status = HttpStatus.BAD_REQUEST;
      code = 'VALIDATION_ERROR';
      const firstIssue = exception.issues[0];
      message = firstIssue?.message ?? 'Validation failed';
      field = firstIssue?.path?.join('.') || undefined;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      // nestjs-zod wraps ZodError inside an HttpException
      if (exceptionResponse?.errors && Array.isArray(exceptionResponse.errors)) {
        code = 'VALIDATION_ERROR';
        const firstErr = exceptionResponse.errors[0];
        message = firstErr?.message ?? exceptionResponse.message ?? 'Validation failed';
        field = firstErr?.path?.join('.') || undefined;
      } else {
        message = typeof exceptionResponse === 'string'
          ? exceptionResponse
          : exceptionResponse.message || exception.message;
        code = typeof exceptionResponse === 'string'
          ? 'HTTP_EXCEPTION'
          : exceptionResponse.error || 'HTTP_EXCEPTION';
      }
    }

    const errorResponse: ApiResponse<null> = {
      success: false,
      data: null,
      error: {
        code,
        message: Array.isArray(message) ? message[0] : message,
        ...(field ? { field } : {}),
      },
    };

    response.status(status).json(errorResponse);
  }
}
