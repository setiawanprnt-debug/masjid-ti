const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zojrbxanaffljpdqyfjo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvanJieGFuYWZmbGpwZHF5ZmpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxNzIzMjQsImV4cCI6MjA5ODc0ODMyNH0.EP30fSKs5aPxDn0WOUW_E8wVpVcAI4PDMddvv3eCeLA'
);

async function check() {
  const { data, error } = await supabase.from('user_roles').select('*');
  console.log('Roles:', data);
  console.log('Error:', error);
}

check();
