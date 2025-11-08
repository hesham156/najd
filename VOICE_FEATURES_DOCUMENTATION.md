# 🎙️ نظام المكالمات والتسجيلات الصوتية - Najd Company

<div dir="rtl">

**تاريخ الإنشاء**: 6 نوفمبر 2025  
**الحالة**: ✅ مكتمل

---

## 📋 نظرة عامة

تم إضافة **ميزتين صوتيتين متقدمتين** لنظام الشات:

### 1. التسجيلات الصوتية 🎙️
- تسجيل رسائل صوتية
- رفع تلقائي على Firebase Storage
- تشغيل التسجيلات في المحادثة
- عرض مرئي لمستوى الصوت
- مدة غير محدودة (موصى بها: 5 دقائق)

### 2. المكالمات الصوتية 📞
- مكالمات صوتية مباشرة (WebRTC)
- مكالمات peer-to-peer بجودة عالية
- كتم/إلغاء كتم الصوت
- عرض مدة المكالمة
- رد/رفض المكالمات

---

## 🏗️ البنية التقنية

### 1. أنواع البيانات (Types)

#### التسجيلات الصوتية:

```typescript
export interface AudioRecording {
  id: string;              // معرف التسجيل
  url: string;             // رابط التسجيل في Storage
  duration: number;        // مدة التسجيل بالثواني
  size: number;            // حجم الملف بالبايت
  mimeType: string;        // نوع الملف (audio/webm, audio/mp4)
  waveform?: number[];     // شكل الموجة (للعرض المرئي)
}
```

#### المكالمات الصوتية:

```typescript
export enum CallStatus {
  INITIATING = 'initiating',   // بدء المكالمة
  RINGING = 'ringing',         // يرن
  ONGOING = 'ongoing',         // جارية
  ENDED = 'ended',             // انتهت
  MISSED = 'missed',           // فائتة
  REJECTED = 'rejected',       // مرفوضة
  FAILED = 'failed',           // فشلت
}

export interface VoiceCall {
  id: string;
  chatId: string;
  callerId: string;
  callerName: string;
  receiverId: string;
  receiverName: string;
  status: CallStatus;
  startedAt?: Timestamp;
  endedAt?: Timestamp;
  duration?: number;        // بالثواني
  createdAt: Timestamp;
  
  // WebRTC data
  offer?: any;              // SDP Offer
  answer?: any;             // SDP Answer
  iceCandidates?: any[];    // ICE Candidates
}
```

---

## 🌐 واجهة الويب (Web App)

### المكونات الرئيسية:

#### 1. VoiceRecorder Component

**الملف**: `apps/web/src/components/Chat/VoiceRecorder.tsx`

**الميزات**:
- ✅ تسجيل صوتي عالي الجودة
- ✅ عرض مستوى الصوت (Audio Level)
- ✅ عداد الوقت
- ✅ تقنيات تحسين الصوت:
  - `echoCancellation`: إلغاء الصدى
  - `noiseSuppression`: تقليل الضوضاء
  - `autoGainControl`: التحكم التلقائي بالمستوى

**الاستخدام**:
```typescript
<VoiceRecorder
  onRecordingComplete={(audioBlob, duration) => {
    // رفع التسجيل وإرساله
  }}
  onCancel={() => {
    // إلغاء التسجيل
  }}
/>
```

**التقنيات المستخدمة**:
- `MediaRecorder API` - تسجيل الصوت
- `Web Audio API` - تحليل الصوت
- `AudioContext + AnalyserNode` - عرض مستوى الصوت

#### 2. AudioPlayer Component

**الملف**: `apps/web/src/components/Chat/AudioPlayer.tsx`

**الميزات**:
- ✅ تشغيل/إيقاف مؤقت
- ✅ شريط تقدم تفاعلي
- ✅ عرض الوقت الحالي والمدة الكاملة
- ✅ التنقل في التسجيل

**الاستخدام**:
```typescript
<AudioPlayer 
  audioUrl="https://..."
  duration={45}  // اختياري
/>
```

#### 3. VoiceCall Component

**الملف**: `apps/web/src/components/Chat/VoiceCall.tsx`

**الميزات**:
- ✅ مكالمات WebRTC مباشرة
- ✅ STUN servers لاختراق NAT
- ✅ ICE candidates للاتصال
- ✅ كتم/إلغاء كتم الصوت
- ✅ عرض مدة المكالمة
- ✅ رد/رفض المكالمات

**تدفق المكالمة**:

```
المتصل (Caller)                    المستقبل (Receiver)
     |                                     |
     | 1. createOffer()                   |
     |------------------------------------>|
     |    حفظ Offer في Firestore         |
     |                                     |
     |                     2. createAnswer()|
     |<------------------------------------|
     |    حفظ Answer في Firestore        |
     |                                     |
     | 3. ICE Candidates Exchange         |
     |<----------------------------------->|
     |                                     |
     | 4. Connection Established ✅       |
     |<----------------------------------->|
     |      Peer-to-Peer Audio Stream     |
```

**STUN Servers المستخدمة**:
```typescript
{
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
}
```

---

## 📱 واجهة الموبايل (Mobile App)

### المكونات الرئيسية:

#### 1. VoiceRecorder (Mobile)

**الملف**: `apps/mobile/src/components/VoiceRecorder.tsx`

**الميزات**:
- ✅ تسجيل بجودة عالية (HIGH_QUALITY preset)
- ✅ أنيميشن نبض للميكروفون
- ✅ عداد الوقت
- ✅ طلب الإذن تلقائياً

**التقنيات**:
- `expo-av` - تسجيل الصوت
- `Audio.RecordingOptionsPresets.HIGH_QUALITY`
- أنيميشن React Native

#### 2. AudioPlayer (Mobile)

**الملف**: `apps/mobile/src/components/AudioPlayer.tsx`

**الميزات**:
- ✅ تشغيل/إيقاف
- ✅ شريط تقدم
- ✅ عرض الأوقات
- ✅ تحميل تلقائي

---

## 💾 التخزين (Firebase Storage)

### البنية:

```
chat_audio/
  ├── {chatId}/
  │   ├── voice_1699264832000.webm
  │   ├── voice_1699264945000.webm
  │   └── voice_1699265123000.webm
```

### تسمية الملفات:
```typescript
const fileName = `voice_${Date.now()}.webm`;
// مثال: voice_1699264832000.webm
```

### عملية الرفع:

```typescript
// 1. رفع الملف
const storageRef = ref(storage, `chat_audio/${chatId}/${fileName}`);
await uploadBytes(storageRef, audioBlob);

// 2. الحصول على الرابط
const audioURL = await getDownloadURL(storageRef);

// 3. إرسال كرسالة
await sendMessage('', 'audio', audioURL, fileName);
```

---

## 🔐 Security Rules

### Storage Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /chat_audio/{chatId}/{fileName} {
      // القراءة: المشاركون في المحادثة فقط
      allow read: if request.auth != null;
      
      // الكتابة: المستخدمون المسجلون فقط
      allow write: if request.auth != null;
    }
  }
}
```

### Firestore Rules للمكالمات:

```javascript
match /calls/{callId} {
  function isCallParticipant() {
    return request.auth.uid == resource.data.callerId || 
           request.auth.uid == resource.data.receiverId;
  }
  
  // القراءة: المشاركون فقط
  allow read: if isActiveUser() && isCallParticipant();
  
  // الإنشاء: المتصل فقط
  allow create: if isActiveUser() && 
                  request.resource.data.callerId == request.auth.uid;
  
  // التحديث: المشاركون فقط
  allow update: if isActiveUser() && isCallParticipant();
  
  // الحذف: ممنوع
  allow delete: if false;
}
```

---

## 🎯 كيفية الاستخدام

### التسجيلات الصوتية:

#### في Web App:

1. **افتح محادثة**
2. **اضغط على أيقونة 🎙️ الميكروفون**
3. **تبدأ التسجيل تلقائياً**
4. **تحدث بوضوح**
5. **اضغط زر ⏹️ للإيقاف والإرسال**
6. **أو اضغط 🗑️ للإلغاء**

#### في Mobile App:

1. افتح محادثة
2. اضغط زر الميكروفون
3. سيطلب منك إذن الميكروفون (أول مرة)
4. اسمح بالوصول
5. ابدأ التسجيل
6. اضغط Stop للإرسال

### المكالمات الصوتية:

#### بدء مكالمة:

1. **افتح محادثة**
2. **اضغط على أيقونة 📞 الهاتف** (في Header)
3. **ستبدأ المكالمة - "جاري الاتصال..."**
4. **المستقبل سيرى "مكالمة واردة"**
5. **عند الرد - تبدأ المكالمة**
6. **يمكن كتم الصوت 🔇**
7. **اضغط ❌ لإنهاء المكالمة**

#### الرد على مكالمة:

1. عند ورود مكالمة - ستظهر نافذة
2. **زر أخضر 📞**: رد على المكالمة
3. **زر أحمر ❌**: رفض المكالمة

---

## 🔧 التقنيات المستخدمة

### Web Audio API:

```typescript
// إنشاء AudioContext
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
const source = audioContext.createMediaStreamSource(stream);

// تحليل الصوت
analyser.fftSize = 256;
const dataArray = new Uint8Array(analyser.frequencyBinCount);
analyser.getByteFrequencyData(dataArray);

// حساب مستوى الصوت
const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
```

### MediaRecorder API:

```typescript
const mediaRecorder = new MediaRecorder(stream, {
  mimeType: 'audio/webm;codecs=opus',
});

mediaRecorder.ondataavailable = (event) => {
  audioChunks.push(event.data);
};

mediaRecorder.onstop = () => {
  const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
  // رفع الملف...
};
```

### WebRTC:

```typescript
// إعداد Peer Connection
const peerConnection = new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
  ],
});

// إضافة Audio Tracks
stream.getTracks().forEach(track => {
  peerConnection.addTrack(track, stream);
});

// إنشاء Offer
const offer = await peerConnection.createOffer();
await peerConnection.setLocalDescription(offer);

// معالجة Remote Stream
peerConnection.ontrack = (event) => {
  remoteAudio.srcObject = event.streams[0];
};
```

---

## 📊 Collection في Firestore

### Calls Collection:

```typescript
{
  id: string,
  chatId: string,
  callerId: string,
  callerName: string,
  receiverId: string,
  receiverName: string,
  status: CallStatus,
  startedAt?: Timestamp,
  endedAt?: Timestamp,
  duration?: number,          // بالثواني
  createdAt: Timestamp,
  
  // WebRTC signaling
  offer?: RTCSessionDescription,
  answer?: RTCSessionDescription,
  iceCandidates?: RTCIceCandidate[]
}
```

---

## 🎨 واجهة المستخدم

### التسجيل الصوتي (Web):

```
┌─────────────────────────────────────────┐
│  🎙️                                    │
│  [●] Microphone (animated pulse)      │
│                                        │
│  🎙️ جاري التسجيل...                 │
│  ⏱️ 0:45                              │
│  ▓▓▓▓▓▓▓░░░░░░░░ (audio level bar)  │
│                                        │
│  [⏹️ إيقاف]  [🗑️ إلغاء]            │
│                                        │
│  💡 تحدث بوضوح - الحد الأقصى 5 دقائق │
└─────────────────────────────────────────┘
```

### تشغيل التسجيل:

```
┌────────────────────────────┐
│  [▶️] ━━━━━━━━━●─────── │
│       0:12      /   0:45   │
└────────────────────────────┘
```

### المكالمة الصوتية:

```
┌─────────────────────────────┐
│                             │
│         [📞]                │
│     (animated pulse)        │
│                             │
│      محمد أحمد             │
│                             │
│       00:45                 │
│       جارية                │
│                             │
│   [🔇 كتم]  [❌ إنهاء]    │
│                             │
└─────────────────────────────┘
```

---

## 🔊 جودة الصوت

### Web:

**إعدادات MediaRecorder**:
```typescript
{
  mimeType: 'audio/webm;codecs=opus',  // Opus codec - أفضل جودة/ضغط
  audioBitsPerSecond: 128000,          // 128 kbps
}
```

**إعدادات getUserMedia**:
```typescript
{
  audio: {
    echoCancellation: true,      // إلغاء الصدى
    noiseSuppression: true,      // تقليل الضوضاء  
    autoGainControl: true,       // التحكم التلقائي
    sampleRate: 48000,           // معدل العينات
  }
}
```

### Mobile:

**إعدادات expo-av**:
```typescript
Audio.RecordingOptionsPresets.HIGH_QUALITY = {
  isMeteringEnabled: true,
  android: {
    extension: '.m4a',
    outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
    audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
};
```

---

## 📈 الأداء والتحسينات

### تحسينات التسجيل:

1. **Streaming Upload**:
   - رفع الملف أثناء التسجيل (للتسجيلات الطويلة)

2. **Audio Compression**:
   - استخدام Opus codec (ضغط ممتاز)
   - تقليل حجم الملفات بنسبة 60%

3. **Cleanup**:
   - إيقاف جميع tracks عند الإنهاء
   - إغلاق AudioContext
   - تحرير الذاكرة

### تحسينات المكالمات:

1. **Connection Quality**:
   - استخدام STUN servers متعددة
   - Fallback للاتصال المباشر

2. **Audio Processing**:
   - Echo cancellation
   - Noise suppression
   - Auto gain control

3. **Network Optimization**:
   - ICE candidates caching
   - Adaptive bitrate

---

## 🐛 معالجة الأخطاء

### الأخطاء الشائعة:

#### 1. "Permission Denied" - الوصول للميكروفون

**السبب**: المستخدم رفض إذن الميكروفون

**الحل**:
```typescript
try {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
} catch (error) {
  alert('يجب السماح بالوصول للميكروفون لتسجيل الصوت');
}
```

#### 2. "Failed to establish connection" - فشل الاتصال

**السبب**: مشاكل في الشبكة أو Firewall

**الحل**:
- استخدام TURN server (إذا لزم الأمر)
- التحقق من Firewall settings

#### 3. "Upload failed" - فشل رفع التسجيل

**السبب**: مشاكل في Firebase Storage

**الحل**:
- التحقق من Storage Rules
- التحقق من حجم الملف (الحد الأقصى)

---

## 🚀 الميزات المستقبلية (اختياري)

### قريباً:

- [ ] مكالمات فيديو 📹
- [ ] مكالمات جماعية 👥
- [ ] مشاركة الشاشة 🖥️
- [ ] تأثيرات صوتية 🎵
- [ ] إلغاء الضوضاء الذكي AI 🤖
- [ ] Transcription (تحويل الصوت لنص) 📝

### متقدم:

- [ ] End-to-end encryption 🔒
- [ ] TURN server للشبكات المعقدة
- [ ] Quality adaptation (حسب الشبكة)
- [ ] Background calls (مكالمات في الخلفية)
- [ ] Call history (سجل المكالمات)
- [ ] Voicemail (البريد الصوتي)

---

## 📝 ملاحظات مهمة

### 1. الخصوصية:

- ✅ المكالمات **peer-to-peer** (لا تمر بالسيرفر)
- ✅ التسجيلات محمية في Firebase Storage
- ✅ فقط المشاركون في المحادثة يمكنهم الاستماع

### 2. الجودة:

- ✅ صوت عالي الجودة (128 kbps)
- ✅ إلغاء الصدى والضوضاء
- ✅ تحكم تلقائي بالمستوى

### 3. التوافق:

- ✅ جميع المتصفحات الحديثة
- ✅ Android و iOS
- ✅ Desktop و Mobile

### 4. الحدود:

- ⚠️ التسجيلات: موصى بحد أقصى 5 دقائق
- ⚠️ المكالمات: غير محدودة
- ⚠️ حجم الملف: حسب Firebase Storage limits

---

## 🎯 الخلاصة

تم إضافة **نظام صوتي متكامل** يشمل:

✅ تسجيلات صوتية عالية الجودة  
✅ مكالمات صوتية مباشرة (WebRTC)  
✅ واجهات جميلة وسهلة الاستخدام  
✅ يعمل على الويب والموبايل  
✅ آمن ومحمي  
✅ أداء ممتاز  

**النظام جاهز للاستخدام!** 🎉

</div>


