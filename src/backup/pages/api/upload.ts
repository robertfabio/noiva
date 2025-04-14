import type { NextApiRequest, NextApiResponse } from 'next';
import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';
import { verifyToken } from '@/lib/vercel/auth';
import * as formidable from 'formidable';
import { promises as fs } from 'fs';

// Desativa o TypeScript para o arquivo formidable, pois os tipos são complicados
// e vários projetos recomendam esta abordagem para evitar erros de tipo
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Apenas aceitar método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    // Verificar autenticação
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token de autenticação obrigatório' });
    }
    
    const token = authHeader.substring(7);
    
    try {
      verifyToken(token);
    } catch {
      return res.status(401).json({ message: 'Token inválido' });
    }
    
    // Usar formidable para processar o arquivo
    const form = formidable.default({
      keepExtensions: true,
      maxFileSize: 200 * 1024 * 1024, // 200MB
    });
    
    const [_fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve([fields, files]);
      });
    });
    
    const file = files.file?.[0] || files.file;
    
    if (!file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }
    
    const id = nanoid();
    const extension = file.originalFilename?.split('.').pop() || '';
    const filename = `${id}.${extension}`;
    
    // Ler o arquivo
    const fileData = await fs.readFile(file.filepath);
    
    // Fazer upload para o Vercel Blob Storage
    const blob = await put(filename, fileData, {
      access: 'public',
    });
    
    return res.status(200).json({
      id,
      url: blob.url,
      filename: file.originalFilename,
      contentType: file.mimetype,
      size: file.size
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    return res.status(500).json({ message: 'Erro ao fazer upload do arquivo' });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}; 