"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiResponse = createApiResponse;
function createApiResponse(success, data, error) {
    return {
        success,
        data,
        error,
        timestamp: new Date().toISOString(),
        requestId: generateRequestId(),
    };
}
function generateRequestId() {
    return (Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15));
}
//# sourceMappingURL=response.js.map