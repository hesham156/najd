# حل مشكلة Java Version

## المشكلة

```
Unsupported class file major version 68
```

هذا الخطأ يظهر لأن **Java 22** (major version 68) جديد جداً ولا يدعمه Gradle بشكل كامل.

## الحل المُوصى به: تثبيت Java 17 LTS

React Native يعمل بشكل أفضل مع **Java 17 LTS** (النسخة الموصى بها).

### الخطوة 1: تحميل Java 17

#### الطريقة الأولى: من Microsoft (موصى بها)
1. اذهب إلى: https://learn.microsoft.com/en-us/java/openjdk/download#openjdk-17
2. حمّل **Microsoft Build of OpenJDK 17** للويندوز (x64)
3. ثبّت البرنامج

#### الطريقة الثانية: من Oracle
1. اذهب إلى: https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
2. حمّل Java SE Development Kit 17
3. ثبّت البرنامج

### الخطوة 2: إعداد JAVA_HOME

#### الطريقة الأولى: عن طريق PowerShell (مؤقت - للتجربة)

```powershell
# مثال: إذا ثبّت Java في المسار التالي
$env:JAVA_HOME="C:\Program Files\Microsoft\jdk-17.0.x"
$env:PATH="$env:JAVA_HOME\bin;$env:PATH"

# تحقق من النسخة
java -version
```

#### الطريقة الثانية: عن طريق إعدادات النظام (دائم)

1. افتح **System Properties** (خصائص النظام)
   - اضغط `Win + R`
   - اكتب `sysdm.cpl`
   - اضغط Enter

2. اذهب إلى **Advanced** > **Environment Variables**

3. تحت **System variables**، أضف/عدّل:
   - **Variable name**: `JAVA_HOME`
   - **Variable value**: `C:\Program Files\Microsoft\jdk-17.0.x` (المسار الذي ثبّت فيه Java 17)

4. عدّل **Path**:
   - ابحث عن متغير `Path`
   - اضغط **Edit**
   - أضف سطر جديد: `%JAVA_HOME%\bin`
   - احذف أي مسارات Java قديمة (Java 22)

5. اضغط **OK** لحفظ كل شيء

6. **مهم**: أعد تشغيل PowerShell/Terminal بالكامل

### الخطوة 3: تحقق من النسخة

```powershell
java -version
```

يجب أن ترى:
```
openjdk version "17.0.x" ...
```

### الخطوة 4: امسح Gradle Cache

```powershell
cd D:\najd\apps\mobile\android
.\gradlew clean
```

أو:
```powershell
Remove-Item -Recurse -Force "$env:USERPROFILE\.gradle\caches"
```

### الخطوة 5: جرّب التشغيل مرة أخرى

```powershell
cd D:\najd\apps\mobile
npx react-native run-android
```

---

## حل بديل: استخدام Java 21

إذا كنت تفضل استخدام Java 21 بدلاً من 17:

1. حمّل Java 21 من:
   - Microsoft: https://learn.microsoft.com/en-us/java/openjdk/download#openjdk-21
   - Oracle: https://www.oracle.com/java/technologies/javase/jdk21-archive-downloads.html

2. اتبع نفس خطوات إعداد JAVA_HOME أعلاه

---

## حل بديل: استخدام Java 22 مع تعديلات (غير موصى به)

إذا أردت الاستمرار مع Java 22 (لا ننصح بهذا):

### 1. استخدم Gradle 8.10 (أحدث نسخة)

عدّل `android/gradle/wrapper/gradle-wrapper.properties`:
```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-8.10-all.zip
```

### 2. حدّث Kotlin إلى آخر نسخة

في `android/build.gradle`:
```gradle
kotlinVersion = '2.0.0'
```

### 3. امسح Cache وجرّب

```powershell
Remove-Item -Recurse -Force "$env:USERPROFILE\.gradle\caches"
cd D:\najd\apps\mobile\android
.\gradlew clean
```

**ملاحظة**: حتى مع هذه التعديلات، قد تواجه مشاكل. Java 17 هو الخيار الأفضل.

---

## مشاكل أخرى

### ADB not found

إذا ظهر لك:
```
'"adb"' is not recognized as an internal or external command
```

**الحل**:

1. ابحث عن مسار Android SDK:
   ```
   C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk
   ```

2. أضف إلى متغير **Path**:
   ```
   C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk\platform-tools
   C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk\emulator
   ```

3. أعد تشغيل Terminal

4. تحقق:
   ```powershell
   adb version
   ```

### No emulator found

إذا لم يكن لديك محاكي:

1. افتح **Android Studio**
2. اذهب إلى **Tools** > **Device Manager**
3. اضغط **Create Virtual Device**
4. اختر جهاز (مثلاً: Pixel 6)
5. اختر System Image (مثلاً: Android 13 - API 33)
6. اضغط **Finish**

7. شغّل المحاكي من Device Manager

8. جرّب مرة أخرى:
   ```powershell
   npx react-native run-android
   ```

---

## الخلاصة

**للحل السريع**:
1. ✅ ثبّت Java 17 LTS
2. ✅ اضبط JAVA_HOME
3. ✅ امسح Gradle cache
4. ✅ أعد التشغيل

**نسخ Java الموصى بها لـ React Native**:
- ✅ Java 17 LTS (الأفضل)
- ✅ Java 11 LTS
- ⚠️ Java 21 (يعمل لكن أحدث قليلاً)
- ❌ Java 22 (غير مدعوم بشكل جيد)

---

**بعد حل مشكلة Java، راجع:**
- `REACT_NATIVE_CLI_SETUP.md` - لإكمال الإعداد
- `MIGRATION_SUMMARY.md` - لملخص التغييرات

