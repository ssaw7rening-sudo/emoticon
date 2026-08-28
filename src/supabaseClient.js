// Supabase 클라이언트 인스턴스 초기화 및 글로벌 Auth 관리
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vbajvkujzzpztdqwsuv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_6hy1Zm38uiUwAtohqkg31w_oAWM16H7';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
