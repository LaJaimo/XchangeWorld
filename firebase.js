import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: "AIzaSyD6vqj7fQjYPq1mNWwosp_UgSvcqzTAqFY",
  authDomain: "audiencia-cf043.firebaseapp.com",
  databaseURL: "https://audiencia-cf043-default-rtdb.firebaseio.com",
  projectId: "audiencia-cf043",
  storageBucket: "audiencia-cf043.firebasestorage.app",
  messagingSenderId: "104535870630",
  appId: "1:104535870630:web:0b38f292a01a1ef2873867"
}

const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
