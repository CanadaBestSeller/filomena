import firebase from 'firebase/app'
import { initializeApp } from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyDHkTVcq1mnu6ebh_CPOVc6gZj9A6Uq_vg',
  authDomain: 'euphrosyne-dev.firebaseapp.com',
  projectId: 'euphrosyne-dev',
  storageBucket: 'euphrosyne-dev.appspot.com',
  messagingSenderId: '755530641911',
  appId: '1:755530641911:web:7c430e4220e62b1f283ef2'
}

initializeApp(firebaseConfig)

export const db = firebase.firestore()
export const auth = firebase.auth()
export const storage = firebase.storage()
