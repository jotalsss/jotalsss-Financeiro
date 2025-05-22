// ATENÇÃO: Este é um sistema de autenticação SIMULADO e INSEGURO.
// NÃO USE EM PRODUÇÃO com dados reais de usuários.
// As senhas são apenas codificadas em Base64 e armazenadas no localStorage,
// o que não é uma prática segura.
// Para produção, utilize um backend dedicado com hashing de senhas robusto.

const USERS_STORAGE_KEY = "realwise_simulated_users";

interface SimulatedUser {
  email: string;
  // Representação da senha (Base64 da senha original - INSEGURO)
  passwordRepresentation: string;
}

function getUsers(): SimulatedUser[] {
  if (typeof window === "undefined") return [];
  const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
}

function saveUsers(users: SimulatedUser[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// Simples codificação Base64 - NÃO É HASHING SEGURO
function representPassword(password: string): string {
  if (typeof window === "undefined") return password; // Fallback se btoa não estiver disponível
  try {
    return btoa(password);
  } catch (e) {
    // console.error("Error in btoa (likely non-ASCII character):", e);
    // Em caso de erro (ex: caracteres não ASCII que btoa não suporta),
    // podemos retornar a senha original ou uma string fixa de erro,
    // mas para este protótipo, vamos retornar a senha original.
    // Uma solução mais robusta seria usar um encoder/decoder que suporte UTF-8 para Base64.
    return password;
  }
}

export function registerUser(email: string, password: string): { success: boolean; message?: string } {
  if (!email || !password) {
    return { success: false, message: "E-mail e senha são obrigatórios." };
  }
  const users = getUsers();
  if (users.find(user => user.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, message: "Este e-mail já está em uso." };
  }

  if (password.length < 6) {
    return { success: false, message: "A senha deve ter pelo menos 6 caracteres." };
  }

  users.push({ email: email.toLowerCase(), passwordRepresentation: representPassword(password) });
  saveUsers(users);
  return { success: true };
}

export function loginUser(email: string, password: string): { success: boolean; message?: string; user?: { email: string } } {
  if (!email || !password) {
    return { success: false, message: "E-mail e senha são obrigatórios." };
  }
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return { success: false, message: "E-mail ou senha inválidos." };
  }

  if (user.passwordRepresentation === representPassword(password)) {
    return { success: true, user: { email: user.email } };
  } else {
    return { success: false, message: "E-mail ou senha inválidos." };
  }
}
