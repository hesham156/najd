# نظام تعيين المهام وإسنادها 📋

<div dir="rtl">

**تاريخ التصميم**: 6 نوفمبر 2025  
**الحالة**: 🚧 قيد التنفيذ

---

## 🎯 الهدف

إنشاء نظام متكامل لتعيين المهام (الطلبات) للموظفين المختصين في كل قسم، مع تتبع الأداء والإنتاجية.

---

## 📊 المتطلبات

### 1. لرؤساء الأقسام:
- ✅ رؤية جميع الطلبات في قسمهم
- ✅ تعيين الطلبات لموظفيهم
- ✅ متابعة حالة كل مهمة
- ✅ إحصائيات الأداء لكل موظف

### 2. للموظفين:
- ✅ رؤية المهام المسندة لهم
- ✅ تحديث حالة المهمة
- ✅ إضافة ملاحظات/تعليقات
- ✅ طلب المساعدة من الرئيس

### 3. للنظام:
- ✅ إشعارات تلقائية عند التعيين
- ✅ تسجيل في Timeline
- ✅ تتبع الوقت المستغرق
- ✅ إحصائيات الإنتاجية

---

## 🏗️ البنية

### الحقول الموجودة في Order:
```typescript
interface Order {
  // ... الحقول الأخرى
  assignedToDesign?: string;       // معرف المصمم
  assignedToPrinting?: string;     // معرف الطبّاع
  assignedToDispatch?: string;     // معرف موظف الإرسال
}
```

### الحقول الجديدة المقترحة:
```typescript
interface TaskAssignment {
  userId: string;                  // المعين له
  userName: string;                // الاسم
  assignedBy: string;              // من عينه (الرئيس)
  assignedByName: string;          // اسم من عينه
  assignedAt: string;              // تاريخ التعيين
  startedAt?: string;              // متى بدأ العمل
  completedAt?: string;            // متى انتهى
  estimatedDuration?: number;      // الوقت المتوقع (ساعات)
  actualDuration?: number;         // الوقت الفعلي (ساعات)
  notes?: string;                  // ملاحظات
}

interface Order {
  // ... الحقول الموجودة
  
  // تفاصيل التعيين (جديد)
  designAssignment?: TaskAssignment;
  printingAssignment?: TaskAssignment;
  dispatchAssignment?: TaskAssignment;
}
```

---

## 🎨 الواجهات

### 1. في صفحة تفاصيل الطلب

#### للرئيس (Head):
```tsx
{user.role === 'design_head' && 
 order.status === 'pending_design' && (
  <div className="bg-white rounded-lg shadow p-6 mb-6">
    <h3 className="text-lg font-bold mb-4">تعيين المصمم</h3>
    
    {/* اختيار موظف */}
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">
        اختر المصمم
      </label>
      <select
        value={selectedDesigner}
        onChange={(e) => setSelectedDesigner(e.target.value)}
        className="w-full border rounded-lg px-4 py-2"
      >
        <option value="">اختر مصمم...</option>
        {designers.map(designer => (
          <option 
            key={designer.uid} 
            value={designer.uid}
            disabled={designer.currentTasks >= 5}
          >
            {designer.displayName} 
            {designer.currentTasks > 0 && 
              ` (لديه ${designer.currentTasks} مهام)`}
          </option>
        ))}
      </select>
    </div>

    {/* الوقت المتوقع */}
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">
        الوقت المتوقع (ساعات)
      </label>
      <input
        type="number"
        min="1"
        value={estimatedHours}
        onChange={(e) => setEstimatedHours(e.target.value)}
        className="w-full border rounded-lg px-4 py-2"
      />
    </div>

    {/* ملاحظات */}
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2">
        ملاحظات للموظف (اختياري)
      </label>
      <textarea
        rows={3}
        value={assignmentNotes}
        onChange={(e) => setAssignmentNotes(e.target.value)}
        placeholder="تعليمات خاصة، أولوية، إلخ..."
        className="w-full border rounded-lg px-4 py-2"
      />
    </div>

    <button
      onClick={handleAssignTask}
      disabled={!selectedDesigner || loading}
      className="w-full bg-najd-blue text-white px-6 py-3 rounded-lg hover:bg-opacity-90 disabled:opacity-50"
    >
      {loading ? 'جاري التعيين...' : '✓ تعيين المهمة'}
    </button>
  </div>
)}

{/* عرض المهمة المعينة */}
{order.designAssignment && (
  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
    <div className="flex justify-between items-start">
      <div>
        <h4 className="font-bold text-gray-900">معين لـ:</h4>
        <p className="text-gray-700">{order.designAssignment.userName}</p>
        <p className="text-sm text-gray-500">
          منذ: {formatDistanceToNow(new Date(order.designAssignment.assignedAt), { locale: ar })}
        </p>
        {order.designAssignment.notes && (
          <p className="text-sm text-gray-600 mt-2">
            📝 {order.designAssignment.notes}
          </p>
        )}
      </div>
      
      {user.role === 'design_head' && (
        <button
          onClick={handleReassignTask}
          className="text-sm text-blue-600 hover:underline"
        >
          إعادة تعيين
        </button>
      )}
    </div>

    {/* Progress */}
    {order.designAssignment.startedAt && !order.designAssignment.completedAt && (
      <div className="mt-4">
        <div className="flex justify-between text-sm mb-1">
          <span>جاري العمل...</span>
          <span>
            {calculateElapsedHours(order.designAssignment.startedAt)} / 
            {order.designAssignment.estimatedDuration} ساعة
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full"
            style={{ 
              width: `${Math.min(
                (calculateElapsedHours(order.designAssignment.startedAt) / 
                 order.designAssignment.estimatedDuration) * 100, 
                100
              )}%` 
            }}
          />
        </div>
      </div>
    )}
  </div>
)}
```

#### للموظف:
```tsx
{/* عرض المهمة للموظف المعين */}
{order.assignedToDesign === user.uid && (
  <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
    <h3 className="text-lg font-bold text-green-800 mb-4">
      ✓ هذه المهمة معينة لك
    </h3>

    {/* معلومات المهمة */}
    <div className="space-y-2 mb-4">
      <p className="text-sm">
        <span className="font-medium">عينها:</span> {order.designAssignment?.assignedByName}
      </p>
      <p className="text-sm">
        <span className="font-medium">منذ:</span> {format(new Date(order.designAssignment?.assignedAt), 'dd MMM yyyy HH:mm', { locale: ar })}
      </p>
      {order.designAssignment?.estimatedDuration && (
        <p className="text-sm">
          <span className="font-medium">الوقت المتوقع:</span> {order.designAssignment.estimatedDuration} ساعة
        </p>
      )}
      {order.designAssignment?.notes && (
        <div className="bg-white rounded p-3 mt-2">
          <p className="text-sm font-medium mb-1">ملاحظات من الرئيس:</p>
          <p className="text-sm text-gray-700">{order.designAssignment.notes}</p>
        </div>
      )}
    </div>

    {/* الإجراءات */}
    {!order.designAssignment?.startedAt && (
      <button
        onClick={handleStartTask}
        className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 mb-2"
      >
        🚀 بدء العمل على المهمة
      </button>
    )}

    {order.designAssignment?.startedAt && !order.designAssignment?.completedAt && (
      <>
        <div className="bg-white rounded p-3 mb-3">
          <p className="text-sm font-medium">الوقت المستغرق:</p>
          <p className="text-2xl font-bold text-green-600">
            {calculateElapsedHours(order.designAssignment.startedAt)} ساعة
          </p>
        </div>
        
        <button
          onClick={handleCompleteTask}
          className="w-full bg-najd-blue text-white px-6 py-3 rounded-lg hover:bg-opacity-90"
        >
          ✓ تم الانتهاء من المهمة
        </button>
      </>
    )}
  </div>
)}
```

---

### 2. Dashboard المهام (جديد)

#### للموظف - صفحة "مهامي":
```tsx
// apps/web/src/app/my-tasks/page.tsx

<div className="min-h-screen bg-gray-50">
  <Navbar />
  
  <main className="max-w-7xl mx-auto py-6 px-4" dir="rtl">
    <h1 className="text-3xl font-bold mb-8">مهامي</h1>

    {/* الإحصائيات */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatCard title="المهام النشطة" value={activeTasks} color="blue" />
      <StatCard title="المكتملة اليوم" value={completedToday} color="green" />
      <StatCard title="المتأخرة" value={overdueTasks} color="red" />
      <StatCard title="متوسط الوقت" value={`${avgTime}h`} color="purple" />
    </div>

    {/* المهام النشطة */}
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">المهام النشطة</h2>
      {myActiveTasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>

    {/* المهام المكتملة */}
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">المهام المكتملة</h2>
      {myCompletedTasks.map(task => (
        <TaskCard key={task.id} task={task} showStats />
      ))}
    </div>
  </main>
</div>
```

#### للرئيس - صفحة "إدارة المهام":
```tsx
// apps/web/src/app/manage-tasks/page.tsx

<div className="min-h-screen bg-gray-50">
  <Navbar />
  
  <main className="max-w-7xl mx-auto py-6 px-4" dir="rtl">
    <h1 className="text-3xl font-bold mb-8">إدارة مهام الفريق</h1>

    {/* نظرة عامة */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard title="إجمالي المهام" value={totalTasks} />
      <StatCard title="قيد التنفيذ" value={inProgressTasks} />
      <StatCard title="معدل الإنجاز" value={`${completionRate}%`} />
    </div>

    {/* أداء الفريق */}
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">أداء الفريق</h2>
      
      <table className="w-full">
        <thead>
          <tr>
            <th>الموظف</th>
            <th>المهام النشطة</th>
            <th>المكتملة اليوم</th>
            <th>متوسط الوقت</th>
            <th>معدل الإنجاز</th>
          </tr>
        </thead>
        <tbody>
          {teamMembers.map(member => (
            <tr key={member.uid}>
              <td>{member.displayName}</td>
              <td>{member.activeTasks}</td>
              <td>{member.completedToday}</td>
              <td>{member.avgCompletionTime}h</td>
              <td>
                <span className={`badge ${
                  member.completionRate >= 90 ? 'bg-green-500' :
                  member.completionRate >= 70 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}>
                  {member.completionRate}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* المهام الغير معينة */}
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">
        مهام تحتاج تعيين ({unassignedTasks.length})
      </h2>
      {unassignedTasks.map(task => (
        <UnassignedTaskCard 
          key={task.id} 
          task={task} 
          onAssign={handleAssign}
        />
      ))}
    </div>
  </main>
</div>
```

---

## ⚡ Cloud Function للتعيين

```typescript
// functions/src/triggers/taskAssignmentTriggers.ts

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * تعيين مهمة لموظف
 */
export const assignTask = functions.https.onCall(async (data, context) => {
  // التحقق من الصلاحيات
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'يجب تسجيل الدخول');
  }

  const { orderId, userId, department, estimatedDuration, notes } = data;

  // التحقق من أن المستخدم رئيس قسم
  const callerDoc = await db.collection('users').doc(context.auth.uid).get();
  const caller = callerDoc.data();

  if (!caller?.isHead) {
    throw new functions.https.HttpsError(
      'permission-denied', 
      'فقط رؤساء الأقسام يمكنهم تعيين المهام'
    );
  }

  // التحقق من أن الموظف في نفس القسم
  const userDoc = await db.collection('users').doc(userId).get();
  const user = userDoc.data();

  if (user?.department !== department) {
    throw new functions.https.HttpsError(
      'invalid-argument', 
      'الموظف ليس في نفس القسم'
    );
  }

  try {
    // إنشاء معلومات التعيين
    const assignment = {
      userId,
      userName: user.displayName,
      assignedBy: context.auth.uid,
      assignedByName: caller.displayName,
      assignedAt: admin.firestore.FieldValue.serverTimestamp(),
      estimatedDuration,
      notes,
    };

    // تحديث الطلب
    const updateData: any = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    switch (department) {
      case 'design':
        updateData.assignedToDesign = userId;
        updateData.designAssignment = assignment;
        updateData.status = 'in_design';
        break;
      case 'printing':
        updateData.assignedToPrinting = userId;
        updateData.printingAssignment = assignment;
        updateData.status = 'in_printing';
        break;
      case 'dispatch':
        updateData.assignedToDispatch = userId;
        updateData.dispatchAssignment = assignment;
        break;
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

    await db.collection('orders').doc(orderId).update(updateData);

    // إرسال إشعار للموظف
    const notificationRef = db.collection('notifications').doc();
    await notificationRef.set({
      id: notificationRef.id,
      type: 'task_assigned',
      title: 'مهمة جديدة تم تعيينها لك',
      message: `تم تعيين مهمة جديدة لك من قبل ${caller.displayName}`,
      recipientId: userId,
      recipientRole: user.role,
      orderId,
      isRead: false,
      isActionRequired: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      actionUrl: `/orders/${orderId}`,
    });

    // إرسال Push Notification
    if (user.fcmToken) {
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

    return { success: true, message: 'تم تعيين المهمة بنجاح' };
    
  } catch (error) {
    console.error('Error assigning task:', error);
    throw new functions.https.HttpsError('internal', 'فشل تعيين المهمة');
  }
});

/**
 * بدء العمل على مهمة
 */
export const startTask = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'يجب تسجيل الدخول');
  }

  const { orderId, department } = data;

  const assignmentField = `${department}Assignment.startedAt`;

  await db.collection('orders').doc(orderId).update({
    [assignmentField]: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true };
});

/**
 * إكمال مهمة
 */
export const completeTask = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'يجب تسجيل الدخول');
  }

  const { orderId, department } = data;

  const orderDoc = await db.collection('orders').doc(orderId).get();
  const order = orderDoc.data();

  const assignment = order?.[`${department}Assignment`];
  
  if (!assignment) {
    throw new functions.https.HttpsError('not-found', 'المهمة غير موجودة');
  }

  // حساب الوقت الفعلي
  const startedAt = assignment.startedAt?.toDate();
  const now = new Date();
  const actualDuration = startedAt ? 
    (now.getTime() - startedAt.getTime()) / (1000 * 60 * 60) : // ساعات
    null;

  await db.collection('orders').doc(orderId).update({
    [`${department}Assignment.completedAt`]: admin.firestore.FieldValue.serverTimestamp(),
    [`${department}Assignment.actualDuration`]: actualDuration,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { 
    success: true,
    actualDuration: actualDuration?.toFixed(2),
  };
});
```

---

## 📊 الإحصائيات والتقارير

### للموظف:
- إجمالي المهام المكتملة
- متوسط الوقت للمهمة
- معدل الإنجاز
- المهام المتأخرة

### للرئيس:
- أداء كل موظف
- توزيع المهام
- الاختناقات (Bottlenecks)
- تقارير الإنتاجية

---

## 🎯 الفوائد

1. ✅ **توزيع عادل للمهام**
2. ✅ **تتبع دقيق للأداء**
3. ✅ **زيادة الإنتاجية**
4. ✅ **شفافية كاملة**
5. ✅ **إشعارات فورية**
6. ✅ **تقارير مفصلة**

---

**الحالة**: 🚧 قيد التنفيذ الآن

</div>


