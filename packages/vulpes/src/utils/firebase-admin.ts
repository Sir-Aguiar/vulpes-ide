// filepath: c:\Users\felip\Documents\Code\vulpes-ide\packages\vulpes\src\utils\firebase-admin.ts
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";

// Adicione uma verificação para garantir que as variáveis de ambiente foram carregadas
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
  throw new Error(
    "As variáveis de ambiente do Firebase Admin não foram definidas. Verifique seu arquivo .env e reinicie o servidor.",
  );
}

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // A chave agora é lida diretamente, sem replaceAll
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
};

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const dbAdmin = getFirestore();

export { dbAdmin };
