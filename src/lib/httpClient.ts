import axios, { AxiosError, AxiosInstance } from "axios";
import { AppError, ExternalApiError } from "./errors";

export function createHTTPClient(): AxiosInstance {
    const client = axios.create({
        headers: {
            'Accept': 'application/json'
        }
    })

    client.interceptors.response.use((response) => response, async (error: AxiosError) => {
        if (error.response) {
            throw new ExternalApiError(
                `External API returned ${error.response.status}: ${error.response.statusText}`
            );
        }

        throw new AppError('External Api unreachable', "SERVICE_UNAVAILABLE", 502);
    })

    return client
}

export const httpClient = createHTTPClient()