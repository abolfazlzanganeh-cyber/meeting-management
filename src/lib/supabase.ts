import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vqjtyailfrgsqzmbifhw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hp7HhbpPLuYuOPr8IKZCXQ_kNyE8ljz';

let supabaseClient: any = null;
let connectionState: 'unknown' | 'ok' | 'failed' = 'unknown';

export function getSupabase() {
  if (!supabaseClient) {
    try {
      supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false },
        global: { fetch: (url, options = {}) => fetch(url, { ...options, signal: options.signal || AbortSignal.timeout(5000) }) },
      });
    } catch (e) {
      return null;
    }
  }
  return supabaseClient;
}

// تست اتصال با timeout ۳ ثانیه‌ای
async function testConnectionWithTimeout(): Promise<boolean> {
  if (connectionState !== 'unknown') return connectionState === 'ok';
  
  const client = getSupabase();
  if (!client) {
    connectionState = 'failed';
    return false;
  }
  
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      connectionState = 'failed';
      console.warn('⚠️ Supabase timeout - using localStorage');
      resolve(false);
    }, 3000);
    
    client.from('users').select('id').limit(1).then(({ error }) => {
      clearTimeout(timeoutId);
      if (error) {
        connectionState = 'failed';
        console.warn('⚠️ Supabase error:', error.message, '- using localStorage');
        resolve(false);
      } else {
        connectionState = 'ok';
        console.log('✅ Supabase connected - cloud sync enabled');
        resolve(true);
      }
    }).catch(() => {
      clearTimeout(timeoutId);
      connectionState = 'failed';
      resolve(false);
    });
  });
}

export async function getAllFromTable(tableName: string): Promise<any[]> {
  const useCloud = await testConnectionWithTimeout();
  
  if (useCloud) {
    try {
      const client = getSupabase();
      const { data, error } = await client.from(tableName).select('*');
      if (!error && data) return data;
    } catch (e) {
      console.warn(`Cloud read failed for ${tableName}, using localStorage`);
    }
  }
  
  // Fallback to localStorage
  try {
    const data = localStorage.getItem(`mms_${tableName}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function upsertToTable(tableName: string, rows: any[]): Promise<void> {
  if (!rows || rows.length === 0) return;
  
  // همیشه در localStorage ذخیره کن (برای سرعت)
  try {
    localStorage.setItem(`mms_${tableName}`, JSON.stringify(rows));
  } catch (e) {
    console.error('localStorage save failed:', e);
  }
  
  // اگر Supabase وصل است، در ابر هم sync کن
  if (connectionState === 'ok') {
    try {
      const client = getSupabase();
      await client.from(tableName).upsert(rows, { onConflict: 'id' });
    } catch (e) {
      console.warn(`Cloud sync failed for ${tableName}, data saved locally`);
    }
  }
}