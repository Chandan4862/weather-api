import { GraphQLError } from "graphql";

export class AppError extends GraphQLError {
    public readonly code: string
    public readonly statusCode: number
    constructor(message: string, code: string, statusCode: number) {
        // GraphQL v15: positional args (message, nodes, source, positions, path, originalError, extensions)
        super(
            message,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            { code, statusCode }
        );
        this.code = code;
        this.statusCode = statusCode
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 'VALIDATION_ERROR', 400)
    }
}

export class ExternalApiError extends AppError {
    constructor(message: string) {
        super(message, 'EXTERNAL_API_ERROR', 502)
    }
}

export class NotFoundError extends AppError {
    constructor(message: string) {
        super(message, 'NOT_FOUND', 404);
    }
}
