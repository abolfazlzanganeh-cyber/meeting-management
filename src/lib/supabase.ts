import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vqjtyailfrgsqzmbifhw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hp7HhbpPLuYuOPr8IKZCXQ_kNyE8ljz';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function getAllFromTable(tableName: string) {
  try {
    const { data, error } = await supabase.from(tableName).select('*');
    if (error) {
      console.error(`❌ خطا در خواندن ${tableName}:`, error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error(`❌ خطای شبکه در خواندن ${tableName}:`, err);
    return [];
  }
}

export async function upsertToTable(tableName: string, rows: any[]) {
  if (!rows || rows.length === 0) return;
  try {
    const { error } = await supabase.from(tableName).upsert(rows, { onConflict: 'id' });
    if (error) {
      console.error(`❌ خطا در نوشتن در ${tableName}:`, error.message);
    }
  } catch (err) {
    console.error(`❌ خطای شبکه در نوشتن در ${tableName}:`, err);
  }
}