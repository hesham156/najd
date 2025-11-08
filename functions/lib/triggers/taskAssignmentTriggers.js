"use strict";
/**
 * مُحفِّزات تعيين المهام - Task Assignment Triggers
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
exports.reassignTask = exports.completeTask = exports.startTask = exports.assignTask = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
/**
 * تعيين مهمة لموظف
 */
exports.assignTask = functions.https.onCall(async (data, context) => {
    // التحقق من المصادقة
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'يجب تسجيل الدخول');
    }
    const { orderId, userId, department, estimatedDuration, notes } = data;
    // التحقق من البيانات المطلوبة
    if (!orderId || !userId || !department) {
        throw new functions.https.HttpsError('invalid-argument', 'البيانات المطلوبة ناقصة');
    }
    try {
        // الحصول على بيانات المستخدم الذي يقوم بالتعيين
        const callerDoc = await db.collection('users').doc(context.auth.uid).get();
        if (!callerDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'المستخدم غير موجود');
        }
        const caller = callerDoc.data();
        // التحقق من أن المستخدم رئيس قسم
        if (!caller.isHead && caller.role !== 'ceo') {
            throw new functions.https.HttpsError('permission-denied', 'فقط رؤساء الأقسام و CEO يمكنهم تعيين المهام');
        }
        // الحصول على بيانات الموظف المُعين له
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'الموظف المُعين غير موجود');
        }
        const user = userDoc.data();
        // التحقق من أن الموظف نشط
        if (!user.isActive) {
            throw new functions.https.HttpsError('failed-precondition', 'الموظف غير نشط');
        }
        // التحقق من أن الموظف في نفس القسم
        if (user.department !== department && caller.role !== 'ceo') {
            throw new functions.https.HttpsError('invalid-argument', 'الموظف ليس في نفس القسم');
        }
        // إنشاء معلومات التعيين
        const assignment = {
            userId,
            userName: user.displayName,
            assignedBy: context.auth.uid,
            assignedByName: caller.displayName,
            assignedAt: admin.firestore.FieldValue.serverTimestamp(),
            estimatedDuration: estimatedDuration || null,
            notes: notes || null,
            startedAt: null,
            completedAt: null,
            actualDuration: null,
        };
        // تحديث الطلب
        const updateData = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        // تحديد الحقول حسب القسم
        switch (department) {
            case 'design':
                updateData.assignedToDesign = userId;
                updateData.designAssignment = assignment;
                // تحديث الحالة إذا كانت pending_design
                break;
            case 'printing':
                updateData.assignedToPrinting = userId;
                updateData.printingAssignment = assignment;
                break;
            case 'dispatch':
                updateData.assignedToDispatch = userId;
                updateData.dispatchAssignment = assignment;
                break;
            default:
                throw new functions.https.HttpsError('invalid-argument', 'قسم غير صحيح');
        }
        // إضافة Timeline Entry
        const timelineEntry = {
            id: Date.now().toString(),
            action: `تم تعيين المهمة لـ ${user.displayName}`,
            userId: context.auth.uid,
            userName: caller.displayName,
            userRole: caller.role,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            notes: notes || undefined,
        };
        updateData.timeline = admin.firestore.FieldValue.arrayUnion(timelineEntry);
        // تحديث الطلب
        await db.collection('orders').doc(orderId).update(updateData);
        // إرسال إشعار للموظف المُعين
        const notificationRef = db.collection('notifications').doc();
        await notificationRef.set({
            id: notificationRef.id,
            type: 'task_assigned',
            title: 'مهمة جديدة تم تعيينها لك 🎯',
            message: `تم تعيين مهمة جديدة لك من قبل ${caller.displayName}`,
            recipientId: userId,
            recipientRole: user.role,
            orderId,
            isRead: false,
            isActionRequired: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            actionUrl: `/orders/${orderId}`,
        });
        // إرسال Push Notification إذا كان متاح
        if (user.fcmToken) {
            try {
                await admin.messaging().send({
                    token: user.fcmToken,
                    notification: {
                        title: '🎯 مهمة جديدة',
                        body: `تم تعيين مهمة جديدة لك من قبل ${caller.displayName}`,
                    },
                    data: {
                        orderId,
                        type: 'task_assigned',
                    },
                });
            }
            catch (error) {
                console.error('Error sending push notification:', error);
                // لا نفشل العملية بسبب خطأ في الإشعار
            }
        }
        console.log(`Task assigned successfully: Order ${orderId} to User ${userId}`);
        return {
            success: true,
            message: 'تم تعيين المهمة بنجاح',
            assignment,
        };
    }
    catch (error) {
        console.error('Error assigning task:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'فشل تعيين المهمة');
    }
});
/**
 * بدء العمل على مهمة
 */
exports.startTask = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'يجب تسجيل الدخول');
    }
    const { orderId, department } = data;
    if (!orderId || !department) {
        throw new functions.https.HttpsError('invalid-argument', 'البيانات المطلوبة ناقصة');
    }
    try {
        // التحقق من أن الطلب معين للمستخدم الحالي
        const orderDoc = await db.collection('orders').doc(orderId).get();
        if (!orderDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'الطلب غير موجود');
        }
        const order = orderDoc.data();
        const assignmentField = `assigned${department.charAt(0).toUpperCase() + department.slice(1)}`;
        if (order[assignmentField] !== context.auth.uid) {
            throw new functions.https.HttpsError('permission-denied', 'المهمة غير معينة لك');
        }
        // تحديث وقت البدء
        await db.collection('orders').doc(orderId).update({
            [`${department}Assignment.startedAt`]: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`Task started: Order ${orderId} by User ${context.auth.uid}`);
        return {
            success: true,
            message: 'تم بدء المهمة بنجاح',
            startedAt: new Date().toISOString(),
        };
    }
    catch (error) {
        console.error('Error starting task:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'فشل بدء المهمة');
    }
});
/**
 * إكمال مهمة
 */
exports.completeTask = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'يجب تسجيل الدخول');
    }
    const { orderId, department } = data;
    if (!orderId || !department) {
        throw new functions.https.HttpsError('invalid-argument', 'البيانات المطلوبة ناقصة');
    }
    try {
        // الحصول على الطلب
        const orderDoc = await db.collection('orders').doc(orderId).get();
        if (!orderDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'الطلب غير موجود');
        }
        const order = orderDoc.data();
        const assignmentField = `assigned${department.charAt(0).toUpperCase() + department.slice(1)}`;
        const assignment = order[`${department}Assignment`];
        // التحقق من أن المهمة معينة للمستخدم
        if (order[assignmentField] !== context.auth.uid) {
            throw new functions.https.HttpsError('permission-denied', 'المهمة غير معينة لك');
        }
        // التحقق من أن المهمة بدأت
        if (!assignment || !assignment.startedAt) {
            throw new functions.https.HttpsError('failed-precondition', 'يجب بدء المهمة أولاً');
        }
        // حساب الوقت الفعلي
        const startedAt = assignment.startedAt.toDate();
        const now = new Date();
        const actualDuration = (now.getTime() - startedAt.getTime()) / (1000 * 60 * 60); // ساعات
        // تحديث المهمة
        const updateData = {
            [`${department}Assignment.completedAt`]: admin.firestore.FieldValue.serverTimestamp(),
            [`${department}Assignment.actualDuration`]: Math.round(actualDuration * 100) / 100,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        // إضافة Timeline Entry
        const userDoc = await db.collection('users').doc(context.auth.uid).get();
        const user = userDoc.data();
        const timelineEntry = {
            id: Date.now().toString(),
            action: `أكمل ${user.displayName} المهمة`,
            userId: context.auth.uid,
            userName: user.displayName,
            userRole: user.role,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            notes: `الوقت المستغرق: ${actualDuration.toFixed(2)} ساعة`,
        };
        updateData.timeline = admin.firestore.FieldValue.arrayUnion(timelineEntry);
        await db.collection('orders').doc(orderId).update(updateData);
        // إرسال إشعار لرئيس القسم
        if (assignment.assignedBy) {
            const notificationRef = db.collection('notifications').doc();
            await notificationRef.set({
                id: notificationRef.id,
                type: 'task_completed',
                title: 'مهمة مكتملة ✓',
                message: `أكمل ${user.displayName} المهمة المعينة له`,
                recipientId: assignment.assignedBy,
                orderId,
                isRead: false,
                isActionRequired: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                actionUrl: `/orders/${orderId}`,
            });
        }
        console.log(`Task completed: Order ${orderId} by User ${context.auth.uid} in ${actualDuration.toFixed(2)} hours`);
        return {
            success: true,
            message: 'تم إكمال المهمة بنجاح',
            actualDuration: Math.round(actualDuration * 100) / 100,
            completedAt: new Date().toISOString(),
        };
    }
    catch (error) {
        console.error('Error completing task:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'فشل إكمال المهمة');
    }
});
/**
 * إعادة تعيين مهمة لموظف آخر
 */
exports.reassignTask = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'يجب تسجيل الدخول');
    }
    const { orderId, newUserId, department, reason } = data;
    if (!orderId || !newUserId || !department) {
        throw new functions.https.HttpsError('invalid-argument', 'البيانات المطلوبة ناقصة');
    }
    try {
        // التحقق من الصلاحيات
        const callerDoc = await db.collection('users').doc(context.auth.uid).get();
        const caller = callerDoc.data();
        if (!caller.isHead && caller.role !== 'ceo') {
            throw new functions.https.HttpsError('permission-denied', 'فقط رؤساء الأقسام يمكنهم إعادة التعيين');
        }
        // الحصول على الطلب الحالي
        const orderDoc = await db.collection('orders').doc(orderId).get();
        const order = orderDoc.data();
        const oldAssignment = order[`${department}Assignment`];
        // الحصول على بيانات الموظف الجديد
        const newUserDoc = await db.collection('users').doc(newUserId).get();
        const newUser = newUserDoc.data();
        // إنشاء تعيين جديد
        const newAssignment = Object.assign(Object.assign({}, oldAssignment), { userId: newUserId, userName: newUser.displayName, assignedBy: context.auth.uid, assignedByName: caller.displayName, assignedAt: admin.firestore.FieldValue.serverTimestamp(), startedAt: null, completedAt: null, actualDuration: null, reassignReason: reason || 'غير محدد' });
        const assignmentField = `assigned${department.charAt(0).toUpperCase() + department.slice(1)}`;
        await db.collection('orders').doc(orderId).update({
            [assignmentField]: newUserId,
            [`${department}Assignment`]: newAssignment,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        // إشعار للموظف الجديد
        const notificationRef = db.collection('notifications').doc();
        await notificationRef.set({
            id: notificationRef.id,
            type: 'task_assigned',
            title: 'مهمة جديدة تم تعيينها لك 🎯',
            message: `تم تعيين مهمة لك من قبل ${caller.displayName}`,
            recipientId: newUserId,
            orderId,
            isRead: false,
            isActionRequired: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            actionUrl: `/orders/${orderId}`,
        });
        return {
            success: true,
            message: 'تم إعادة تعيين المهمة بنجاح',
        };
    }
    catch (error) {
        console.error('Error reassigning task:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError('internal', 'فشل إعادة التعيين');
    }
});
//# sourceMappingURL=taskAssignmentTriggers.js.map