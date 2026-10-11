import { getSupabase } from './supabase';

export interface CircuitLeaderboardRecord {
  id?: string;
  player_id?: string;
  username: string;
  car_model: string;
  car_color: string;
  total_time: number;
  best_lap_time: number;
  lap_count?: number;
  created_at?: string;
}

/**
 * Simpan hasil balapan (3 Lap) ke tabel 'circuit_leaderboard' di Supabase.
 */
export async function saveRaceRecord(
  record: Omit<CircuitLeaderboardRecord, 'id' | 'created_at'>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      console.warn('[Leaderboard] Supabase client tidak terkonfigurasi.');
      return { success: false, error: 'Supabase client unavailable' };
    }

    // Validasi data sebelum simpan
    if (!record.username || record.total_time <= 0 || record.best_lap_time <= 0) {
      return { success: false, error: 'Data balapan tidak valid' };
    }

    const payload = {
      player_id: record.player_id || 'anonymous',
      username: record.username.slice(0, 30),
      car_model: record.car_model || 'sport',
      car_color: record.car_color || '#06b6d4',
      total_time: Number(record.total_time.toFixed(2)),
      best_lap_time: Number(record.best_lap_time.toFixed(2)),
      lap_count: record.lap_count || 3,
    };

    const { error } = await supabase.from('circuit_leaderboard').insert([payload]);

    if (error) {
      console.warn('[Leaderboard] Gagal menyimpan ke Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.warn('[Leaderboard] Error saving race record:', err?.message || err);
    return { success: false, error: err?.message || 'Unknown error' };
  }
}

/**
 * Mengambil daftar rekor balapan terbaik (Hall of Fame) dari Supabase.
 * Diurutkan berdasarkan Total Waktu tercepat (Ascending).
 */
export async function fetchGlobalLeaderboard(
  limit: number = 10
): Promise<CircuitLeaderboardRecord[]> {
  try {
    const supabase = getSupabase();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('circuit_leaderboard')
      .select('*')
      .order('total_time', { ascending: true })
      .limit(limit);

    if (error) {
      // Jika tabel belum dibuat di Supabase, jangan crash aplikasi
      console.warn('[Leaderboard] Tabel circuit_leaderboard belum tersedia di Supabase:', error.message);
      return [];
    }

    return (data as CircuitLeaderboardRecord[]) || [];
  } catch (err) {
    console.warn('[Leaderboard] Error fetching leaderboard:', err);
    return [];
  }
}
