"use strict";
/**
 * Firebase Cloud Functions - Najd Company
 * وظائف الأتمتة والإشعارات
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onMessageDeleted = exports.cleanupOldChats = exports.onMessageRead = exports.onNewMessage = exports.reassignTask = exports.completeTask = exports.startTask = exports.assignTask = exports.cleanupOldNotifications = exports.generateOrderNumber = exports.sendNotificationToRole = exports.sendNotificationToUser = exports.onOrderStatusChanged = exports.onOrderCreated = void 0;
const admin = __importStar(require("firebase-admin"));
// تهيئة Firebase Admin
admin.initializeApp();
// استيراد الوظائف
var orderTriggers_1 = require("./triggers/orderTriggers");
Object.defineProperty(exports, "onOrderCreated", { enumerable: true, get: function () { return orderTriggers_1.onOrderCreated; } });
Object.defineProperty(exports, "onOrderStatusChanged", { enumerable: true, get: function () { return orderTriggers_1.onOrderStatusChanged; } });
var notificationTriggers_1 = require("./triggers/notificationTriggers");
Object.defineProperty(exports, "sendNotificationToUser", { enumerable: true, get: function () { return notificationTriggers_1.sendNotificationToUser; } });
Object.defineProperty(exports, "sendNotificationToRole", { enumerable: true, get: function () { return notificationTriggers_1.sendNotificationToRole; } });
var counterTriggers_1 = require("./triggers/counterTriggers");
Object.defineProperty(exports, "generateOrderNumber", { enumerable: true, get: function () { return counterTriggers_1.generateOrderNumber; } });
var cleanup_1 = require("./scheduled/cleanup");
Object.defineProperty(exports, "cleanupOldNotifications", { enumerable: true, get: function () { return cleanup_1.cleanupOldNotifications; } });
var taskAssignmentTriggers_1 = require("./triggers/taskAssignmentTriggers");
Object.defineProperty(exports, "assignTask", { enumerable: true, get: function () { return taskAssignmentTriggers_1.assignTask; } });
Object.defineProperty(exports, "startTask", { enumerable: true, get: function () { return taskAssignmentTriggers_1.startTask; } });
Object.defineProperty(exports, "completeTask", { enumerable: true, get: function () { return taskAssignmentTriggers_1.completeTask; } });
Object.defineProperty(exports, "reassignTask", { enumerable: true, get: function () { return taskAssignmentTriggers_1.reassignTask; } });
var chatTriggers_1 = require("./triggers/chatTriggers");
Object.defineProperty(exports, "onNewMessage", { enumerable: true, get: function () { return chatTriggers_1.onNewMessage; } });
Object.defineProperty(exports, "onMessageRead", { enumerable: true, get: function () { return chatTriggers_1.onMessageRead; } });
Object.defineProperty(exports, "cleanupOldChats", { enumerable: true, get: function () { return chatTriggers_1.cleanupOldChats; } });
Object.defineProperty(exports, "onMessageDeleted", { enumerable: true, get: function () { return chatTriggers_1.onMessageDeleted; } });
//# sourceMappingURL=index.js.map