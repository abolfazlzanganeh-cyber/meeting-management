import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vqjtyailfrgsqzmbifhw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hp7HhbpPLuYuOPr8IKZCXQ_kNyE8ljz';

let supabaseClient: any = null;
let connectionTested = false;
let connectionOk = false;

export function getSupabase() {
  if (!supabaseClient) {
    try {
      supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (e) {
      return null;
    }
  }
  return supabaseClient;
}

export async function testConnection(): Promise<boolean> {
  if (connectionTested) return connectionOk;
  const client = getSupabase();
  if (!client) {
    connectionOk = false;
    connectionTested = true;
    return false;
  }
  try {
    const { error } = await client.from('users').select('id').limit(1);
    connectionOk = !error;
    connectionTested = true;
    return connectionOk;
  } catch (e) {
    connectionOk = false;
    connectionTested = true;
    return false;
  }
}

export async function getAllFromTable(tableName: string): Promise<any[]> {
  const useCloud = await testConnection();
  if (useCloud) {
    try {
      const client = getSupabase();
      const { data, error } = await client.from(tableName).select('*');
      if (!error && data) return data;
    } catch (e) {
      console.warn(`Cloud read failed for ${tableName}, using localStorage`);
    }
  }
  try {
    const data = localStorage.getItem(`mms_${tableName}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function upsertToTable(tableName: string, rows: any[]): Promise<void> {
  if (!rows || rows.length === 0) return;
  try {
    localStorage.setItem(`mms_${tableName}`, JSON.stringify(rows));
  } catch (e) {
    console.error('localStorage save failed:', e);
  }
  if (connectionOk) {
    try {
      const client = getSupabase();
      await client.from(tableName).upsert(rows, { onConflict: 'id' });
    } catch (e) {
      console.warn(`Cloud sync failed for ${tableName}, data saved locally`);
    }
  }
}