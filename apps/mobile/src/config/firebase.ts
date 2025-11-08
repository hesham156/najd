/**
 * Firebase Configuration - Mobile App
 * React Native Firebase
 */

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// Export Firebase services
// Note: React Native Firebase automatically initializes from google-services.json (Android)
// and GoogleService-Info.plist (iOS)
export { auth, firestore as db, storage };

// For compatibility with existing code
export default {
  auth: () => auth,
  firestore: () => firestore,
  storage: () => storage,
};

