import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { firebaseServiceAccount } from './firebase-service-account';

@Injectable()
export class FirebaseService implements OnModuleInit {
  onModuleInit() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(firebaseServiceAccount as admin.ServiceAccount),
      });
    }
  }

  async verifyGoogleToken(idToken: string) {
    // Verifies Firebase ID token coming from Google sign-in
    // console.log(idToken)
    return admin.auth().verifyIdToken(idToken);
  }
}
