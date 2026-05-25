import { GraphQLError } from "graphql";

export class AppError extends GraphQLError {
    public readonly code: string
    public readonly statusCode: number
    constructor(message: string, code: string, statusCode: number) {
        super(message);
        this.code = code;
        this.statusCode = statusCode
    }

    toGraphQLError(): GraphQLError {
        return new GraphQLError(this.message);
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
