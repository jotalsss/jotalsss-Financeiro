// Import the functions you need from the SDKs you need
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
// Removida a importação de getAuth e Auth, pois a autenticação será simulada localmente.

// Your web app's Firebase configuration
// Este objeto de configuração seria usado se você estivesse utilizando
// outros serviços do Firebase como Firestore, Storage, etc.
// Para a autenticação simulada atual, ele não é diretamente utilizado pelo AuthContext.
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI", // Mantenha como placeholder se não for usar outros serviços Firebase
  authDomain: "SEU_AUTH_DOMAIN_AQUI",
  projectId: "SEU_PROJECT_ID_AQUI",
  storageBucket: "SEU_STORAGE_BUCKET_AQUI",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID_AQUI",
  appId: "SEU_APP_ID_AQUI",
  // measurementId: "SEU_MEASUREMENT_ID_AQUI" // Opcional
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// A exportação do 'auth' do Firebase foi removida, pois a autenticação será simulada.
export { app }; // Exporte 'app' se for usar outros serviços Firebase.
