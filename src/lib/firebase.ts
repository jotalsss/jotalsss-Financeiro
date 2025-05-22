// Import the functions you need from the SDKs you need
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";

// ATENÇÃO: Configure estas variáveis de ambiente no seu provedor de hospedagem (ex: Vercel).
// Estas são as credenciais do seu projeto Firebase.
// O prefixo NEXT_PUBLIC_ é necessário para que as variáveis sejam expostas ao navegador.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "SUA_API_KEY_AQUI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "SEU_AUTH_DOMAIN_AQUI",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "SEU_PROJECT_ID_AQUI",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "SEU_STORAGE_BUCKET_AQUI",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "SEU_MESSAGING_SENDER_ID_AQUI",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "SEU_APP_ID_AQUI",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // Opcional, pode ser deixado undefined
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// A exportação do 'auth' do Firebase foi removida nas etapas anteriores,
// pois a autenticação está sendo simulada localmente.
// Se você for usar outros serviços do Firebase (Firestore, Storage, etc.),
// esta configuração de 'app' será utilizada.
export { app };
