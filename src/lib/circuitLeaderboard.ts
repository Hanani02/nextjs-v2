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
 * Jika user sudah memiliki rekor, perbarui hanya jika rekor baru lebih cepat (best record).
 */
export async function saveRaceRecord(
  record: Omit<CircuitLeaderboardRecord, 'id' | 'created_at'>
): Promise<{ success: boolean; isNewBest?: boolean; error?: string }> {
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

    const cleanUsername = record.username.trim().slice(0, 30);
    const totalTime = Number(record.total_time.toFixed(2));
    const bestLapTime = Number(record.best_lap_time.toFixed(2));

    const payload = {
      player_id: record.player_id || 'anonymous',
      username: cleanUsername,
      car_model: record.car_model || 'sport',
      car_color: record.car_color || '#06b6d4',
      total_time: totalTime,
      best_lap_time: bestLapTime,
      lap_count: record.lap_count || 3,
    };

    // Cek apakah user dengan username yang sama sudah memiliki record di database
    const { data: existingRecords, error: checkError } = await supabase
      .from('circuit_leaderboard')
      .select('id, total_time, best_lap_time')
      .ilike('username', cleanUsername)
      .order('total_time', { ascending: true })
      .order('best_lap_time', { ascending: true })
      .limit(1);

    if (!checkError && existingRecords && existingRecords.length > 0) {
      const best = existingRecords[0];
      const isBetter =
        totalTime < best.total_time ||
        (totalTime === best.total_time && bestLapTime < best.best_lap_time);

      if (!isBetter) {
        // Record saat ini lebih lambat dari best record yang sudah ada
        return { success: true, isNewBest: false };
      }

      // Jika lebih cepat, perbarui record terbaiknya di database
      const { error: updateError } = await supabase
        .from('circuit_leaderboard')
        .update(payload)
        .eq('id', best.id);

      if (!updateError) {
        return { success: true, isNewBest: true };
      }
    }

    const { error } = await supabase.from('circuit_leaderboard').insert([payload]);

    if (error) {
      console.warn('[Leaderboard] Gagal menyimpan ke Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, isNewBest: true };
  } catch (err: any) {
    console.warn('[Leaderboard] Error saving race record:', err?.message || err);
    return { success: false, error: err?.message || 'Unknown error' };
  }
}

/**
 * Mengambil daftar rekor balapan terbaik (Hall of Fame) dari Supabase.
 * - Difilter: hanya menampilkan maksimal 5 user teratas.
 * - Unik per user: jika nama user sama, hanya best record (waktu tercepat) yang ditampilkan.
 */
export async function fetchGlobalLeaderboard(
  limit: number = 5
): Promise<CircuitLeaderboardRecord[]> {
  try {
    const supabase = getSupabase();
    if (!supabase) return [];

    // Ambil sampel data teratas berdasarkan total_time asc dan best_lap_time asc
    const { data, error } = await supabase
      .from('circuit_leaderboard')
      .select('*')
      .order('total_time', { ascending: true })
      .order('best_lap_time', { ascending: true })
      .limit(100);

    if (error) {
      // Jika tabel belum dibuat di Supabase, jangan crash aplikasi
      console.warn('[Leaderboard] Tabel circuit_leaderboard belum tersedia di Supabase:', error.message);
      return [];
    }

    const records = (data as CircuitLeaderboardRecord[]) || [];

    // Filter unik per user: jika nama user sama, hanya ambil best record-nya saja
    const userBestMap = new Map<string, CircuitLeaderboardRecord>();

    for (const record of records) {
      const trimmedName = (record.username || '').trim();
      if (!trimmedName) continue;
      const normalizedKey = trimmedName.toLowerCase();

      const existing = userBestMap.get(normalizedKey);
      if (!existing) {
        userBestMap.set(normalizedKey, record);
      } else {
        // Kriteria best record: total_time lebih kecil, atau jika total_time sama, best_lap_time lebih kecil
        const isBetter =
          record.total_time < existing.total_time ||
          (record.total_time === existing.total_time &&
            record.best_lap_time < existing.best_lap_time);

        if (isBetter) {
          userBestMap.set(normalizedKey, record);
        }
      }
    }

    // Urutkan kembali berdasarkan total_time asc dan best_lap_time asc, lalu potong menjadi 5 user teratas
    const uniqueTopUsers = Array.from(userBestMap.values())
      .sort((a, b) => {
        if (a.total_time !== b.total_time) {
          return a.total_time - b.total_time;
        }
        return a.best_lap_time - b.best_lap_time;
      })
      .slice(0, limit);

    return uniqueTopUsers;
  } catch (err) {
    console.warn('[Leaderboard] Error fetching leaderboard:', err);
    return [];
  }
}
