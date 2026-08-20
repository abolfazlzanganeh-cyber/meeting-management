import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://vqjtyailfrgsqzmbifhw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hp7HhbpPLuYuOPr8IKZCXQ_kNyE8ljz';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export async function getAllFromTable(tableName: string) {
  const { data, error } = await supabase.from(tableName).select('*');
  return error ? [] : (data || []);
}
export async function upsertToTable(tableName: string, rows: any[]) {
  if (!rows || rows.length === 0) return;
  const { error } = await supabase.from(tableName).upsert(rows, { onConflict: 'id' });
  if (error) console.error(`Error in ${tableName}:`, error.message);
}