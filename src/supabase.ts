import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vqjtyailfrgsqzmbifhw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hp7HhbpPLuYuOPr8IKZCXQ_kNyE8ljz';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// توابع کمکی برای کار با Supabase
export async function supabaseUpsert(table: string, data: any) {
  const { data: result, error } = await supabase
    .from(table)
    .upsert(data, { onConflict: 'id' })
    .select();
  
  if (error) {
    console.error(`Error upserting to ${table}:`, error);
    throw error;
  }
  return result;
}

export async function supabaseDelete(table: string, id: string) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error(`Error deleting from ${table}:`, error);
    throw error;
  }
}

export async function supabaseGetAll(table: string) {
  const { data, error } = await supabase
    .from(table)
    .select('*');
  
  if (error) {
    console.error(`Error fetching from ${table}:`, error);
    return [];
  }
  return data || [];
}

export async function supabaseGetById(table: string, id: string) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching from ${table}:`, error);
    return null;
  }
  return data;
}

// Real-time subscriptions
export function subscribeToTable(table: string, callback: (payload: any) => void) {
  return supabase
    .channel(`public:${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
    .subscribe();
}

export function unsubscribeFromChannel(channelName: string) {
  supabase.removeChannel(channelName);
}