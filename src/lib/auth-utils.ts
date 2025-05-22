
// ATENÇÃO: ESTE ARQUIVO CONTÉM LÓGICA DE AUTENTICAÇÃO SIMULADA E INSEGURA.
// NÃO USE EM PRODUÇÃO. SENHAS DEVEM SER TRATADAS POR UM BACKEND SEGURO.

interface StoredUser {
  username: string;
  hashedPassword: string; // Para este protótipo, será btoa(password)
}

const USERS_STORAGE_KEY = "realwise_users_credentials";

// Simulação de hashing. NÃO É SEGURO.
export function hashPassword(password: string): string {
  try {
    return btoa(password); // Base64 encode. Ruim para senhas reais.
  } catch (e) {
    // btoa pode falhar com certos caracteres, para um protótipo mais robusto,
    // seria melhor usar uma biblioteca de hashing do lado do cliente como js-sha256,
    // mas para simplificar e evitar novas dependências, vamos com um fallback.
    console.warn("btoa falhou, usando fallback para hashing (ainda inseguro):", e);
    // Fallback muito simples (não use isso nunca em produção)
    return `fallback_${password.split("").reverse().join("")}`;
  }
}

export function verifyPassword(plainPassword: string, hashedPassword: string): boolean {
  return hashPassword(plainPassword) === hashedPassword;
}

export function getUsers(): StoredUser[] {
  if (typeof window === 'undefined') return [];
  const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
}

function saveUsers(users: StoredUser[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export function findUserByUsername(username: string): StoredUser | undefined {
  const users = getUsers();
  return users.find(user => user.username.toLowerCase() === username.toLowerCase());
}

export function addUser(username: string, plainPassword: string): { success: boolean; message?: string } {
  if (!username || !plainPassword) {
    return { success: false, message: "Nome de usuário e senha são obrigatórios." };
  }
  if (findUserByUsername(username)) {
    return { success: false, message: "Este nome de usuário já está em uso." };
  }
  const users = getUsers();
  const hashedPassword = hashPassword(plainPassword);
  users.push({ username, hashedPassword });
  saveUsers(users);
  return { success: true };
}
