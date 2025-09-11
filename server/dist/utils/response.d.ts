import { ApiResponse } from "../types";
export declare function createApiResponse<T>(success: boolean, data?: T, error?: {
    code: string;
    message: string;
    details?: any;
}): ApiResponse<T>;
//# sourceMappingURL=response.d.ts.map