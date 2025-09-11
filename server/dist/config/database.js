"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = initializeDatabase;
const firebase_1 = require("./firebase");
const logger_1 = require("../utils/logger");
async function initializeDatabase() {
    try {
        await firebase_1.db.collection('_health').doc('test').set({
            timestamp: new Date(),
            status: 'healthy'
        });
        logger_1.logger.info('Database connection established');
    }
    catch (error) {
        logger_1.logger.error('Database connection failed:', error);
        throw new Error('Database initialization failed');
    }
}
//# sourceMappingURL=database.js.map