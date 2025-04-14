import { put, del, list } from '@vercel/blob';
import { nanoid } from 'nanoid';

export interface UploadOptions {
  filename: string;
  contentType: string;
  data: File | Blob | ReadableStream | ArrayBuffer;
}

export interface FileMetadata {
  id: string;
  url: string;
  filename: string;
  contentType: string;
  size?: number;
  uploadedAt: number;
}

/**
 * Faz upload de um arquivo para o Vercel Blob Storage
 */
export const uploadFile = async (options: UploadOptions): Promise<FileMetadata> => {
  try {
    const id = nanoid();
    const fileExtension = options.filename.split('.').pop() || '';
    const filename = `${id}.${fileExtension}`;
    
    const blob = await put(filename, options.data, {
      contentType: options.contentType,
      access: 'public',
    });
    
    return {
      id,
      url: blob.url,
      filename: options.filename,
      contentType: options.contentType,
      uploadedAt: Date.now()
    };
  } catch (error) {
    console.error('Erro ao fazer upload do arquivo:', error);
    throw new Error('Falha ao fazer upload do arquivo');
  }
};

/**
 * Exclui um arquivo do Vercel Blob Storage
 */
export const deleteFile = async (url: string): Promise<boolean> => {
  try {
    await del(url);
    return true;
  } catch (error) {
    console.error('Erro ao excluir arquivo:', error);
    return false;
  }
};

/**
 * Lista todos os arquivos no Vercel Blob Storage
 */
export const listFiles = async (): Promise<{ blobs: { url: string }[] }> => {
  try {
    return await list();
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    return { blobs: [] };
  }
};

// Interface para serviço de armazenamento
interface StorageService {
  uploadFile: (file: File, path: string) => Promise<string>;
  getFileUrl: (filePath: string) => Promise<string>;
}

// Implementação simples para o Vercel/local
class VercelStorage implements StorageService {
  async uploadFile(file: File, path: string): Promise<string> {
    // Esta é uma implementação simulada para o ambiente de desenvolvimento
    // Em produção, você usaria um serviço como Vercel Blob Storage, Amazon S3, ou outros
    console.log(`[Simulação] Fazendo upload do arquivo para ${path}`);
    
    // Aqui você retornaria a URL do arquivo após o upload
    // Mas por enquanto, vamos retornar uma URL simulada
    const fileName = file.name.replace(/\s+/g, '-').toLowerCase();
    return `https://exemplo.com/storage/${path}/${fileName}`;
  }

  async getFileUrl(filePath: string): Promise<string> {
    // Esta é uma implementação simulada
    console.log(`[Simulação] Obtendo URL para ${filePath}`);
    
    // Retorna uma URL simulada
    return `https://exemplo.com/storage/${filePath}`;
  }
}

// Exportar uma instância do serviço de armazenamento
export const storage = new VercelStorage();

export default storage; 