"use strict";
/**
 * مُحفِّز العدادات - Counter Triggers
 * لتوليد أرقام الطلبات التسلسلية
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
exports.generateOrderNumber = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
/**
 * توليد رقم طلب جديد
 */
exports.generateOrderNumber = functions.https.onCall(async (data, context) => {
    // التحقق من الصلاحيات
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'يجب تسجيل الدخول');
    }
    try {
        const counterRef = db.collection('counters').doc('orders');
        // استخدام Transaction لضمان التسلسل الصحيح
        const orderNumber = await db.runTransaction(async (transaction) => {
            const counterDoc = await transaction.get(counterRef);
            let currentCount = 0;
            if (!counterDoc.exists) {
                // إنشاء العداد للمرة الأولى
                transaction.set(counterRef, {
                    count: 1,
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                });
                currentCount = 1;
            }
            else {
                // زيادة العداد
                const counterData = counterDoc.data();
                currentCount = ((counterData === null || counterData === void 0 ? void 0 : counterData.count) || 0) + 1;
                transaction.update(counterRef, {
                    count: currentCount,
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                });
            }
            // توليد رقم الطلب بالصيغة: NAJD-YYYY-XXXX
            const year = new Date().getFullYear();
            const paddedNumber = currentCount.toString().padStart(4, '0');
            return `NAJD-${year}-${paddedNumber}`;
        });
        return { orderNumber };
    }
    catch (error) {
        console.error('Error generating order number:', error);
        throw new functions.https.HttpsError('internal', 'فشل توليد رقم الطلب');
    }
});
//# sourceMappingURL=counterTriggers.js.map