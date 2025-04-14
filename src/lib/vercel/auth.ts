import { createClient } from '@vercel/postgres';
import { hash, compare } from 'bcryptjs';
import { nanoid } from 'nanoid';
import { sign, verify } from 'jsonwebtoken';

// Interfaces
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Cliente DB
export const getClient = () => {
  return createClient();
};

// Inicializar tabelas
export const initializeAuth = async () => {
  const client = getClient();
  
  try {
    // Criar tabela de usuários se não existir
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        uid VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        display_name VARCHAR(255),
        photo_url TEXT,
        password_hash TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
  } finally {
    // O cliente Vercel Postgres não usa o método release()
    // client.release não é necessário
  }
};

// Registro de usuário
export const registerUser = async (email: string, password: string, displayName: string) => {
  const client = getClient();
  
  try {
    // Verificar se o email já existe
    const existingUser = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      throw new Error('Email já cadastrado');
    }
    
    // Criar hash da senha
    const passwordHash = await hash(password, 10);
    
    // Gerar ID único
    const uid = nanoid();
    
    // Inserir novo usuário
    await client.query(
      'INSERT INTO users (uid, email, display_name, password_hash) VALUES ($1, $2, $3, $4)',
      [uid, email, displayName, passwordHash]
    );
    
    return {
      uid,
      email,
      displayName,
      photoURL: null
    };
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    throw error;
  }
};

// Login de usuário
export const loginUser = async (email: string, password: string) => {
  const client = getClient();
  
  try {
    // Buscar usuário pelo email
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Usuário não encontrado');
    }
    
    const user = result.rows[0];
    
    // Verificar senha
    const passwordMatch = await compare(password, user.password_hash);
    
    if (!passwordMatch) {
      throw new Error('Senha incorreta');
    }
    
    // Gerar token JWT
    const token = sign(
      {
        uid: user.uid,
        email: user.email
      },
      process.env.JWT_SECRET || 'supersecret',
      { expiresIn: '7d' }
    );
    
    return {
      token,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.display_name,
        photoURL: user.photo_url
      }
    };
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
};

// Verificar token
export const verifyToken = (token: string) => {
  try {
    const decoded = verify(token, process.env.JWT_SECRET || 'supersecret');
    return decoded;
  } catch {
    throw new Error('Token inválido');
  }
};

// Buscar usuário pelo ID
export const getUserById = async (uid: string) => {
  const client = getClient();
  
  try {
    const result = await client.query(
      'SELECT * FROM users WHERE uid = $1',
      [uid]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.display_name,
      photoURL: user.photo_url
    };
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
}; 