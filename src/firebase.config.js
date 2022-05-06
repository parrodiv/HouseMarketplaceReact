import { initializeApp } from 'firebase/app';
import {getFirestore} from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyC-Gsd7uv_Z14ibW29Iwq8_vri2-dq9iHk',
  authDomain: 'house-marketplace-app-6ed45.firebaseapp.com',
  projectId: 'house-marketplace-app-6ed45',
  storageBucket: 'house-marketplace-app-6ed45.appspot.com',
  messagingSenderId: '811645355804',
  appId: '1:811645355804:web:7cde6c0c80198e1f151cd9',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore()
