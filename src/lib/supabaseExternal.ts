import { createClient } from '@supabase/supabase-js';

const EXTERNAL_SUPABASE_URL = 'https://eqnysptjnrfkwzykyhav.supabase.co';
const EXTERNAL_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxbnlzcHRqbnJma3d6eWt5aGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwODQ3NjksImV4cCI6MjA4ODY2MDc2OX0.cwwIlTUc93nmFf0fyLF8zC7WPUgXwpVoqgkXnLxoCVc';

export const supabaseExternal = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY);
