import { supabase } from "@/lib/supabase";

export default async function TestSupabasePage() {
 const { data, error } = await supabase.from('proyek').select('*');
 console.log('Data dari Supabase:', data);
 console.log('Error (jika ada):', error);
 return <p>Cek terminal VS Code kalian untuk melihat hasilnya.</p>;
}