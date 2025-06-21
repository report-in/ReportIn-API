import { Express } from 'express';
import { bucket } from '../config/firebase';
import { generateUID } from '../utils/generate-uid';
import { supabase } from '../config/supabase';

export const upload = async (file: Express.Multer.File, folder = 'uploads') => {
  const fileName = `${folder}/${Date.now()}-${generateUID()}-${file.originalname}`;

  const { error: uploadError } = await supabase.storage
    .from('reportin')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage
    .from('reportin')
    .getPublicUrl(fileName);

  return data.publicUrl;
};