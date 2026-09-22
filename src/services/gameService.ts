import { requireStudentSupabase, requireSupabase } from '../lib/supabase';
import { GameProgress } from '../types';

const mapProgress = (row: any): GameProgress => ({
  profileId: row.profile_id, stars: row.stars || 0, mascot: row.mascot || 'coruja',
  equippedItem: row.equipped_item, inventory: Array.isArray(row.inventory) ? row.inventory : [],
});

export async function getGameProgress(profileId: string, student = false): Promise<GameProgress> {
  const client = student ? requireStudentSupabase() : requireSupabase();
  const { data, error } = await client.from('game_progress').select('*').eq('profile_id', profileId).maybeSingle();
  if (error) throw error;
  return data ? mapProgress(data) : { profileId, stars: 0, mascot: 'coruja', inventory: [] };
}

export async function awardStars(profileId: string, eventKey: string, reason: 'tarefa'|'ajuda'|'comunicacao'|'mudanca', stars: number): Promise<number> {
  const { data, error } = await requireStudentSupabase().rpc('award_student_stars', {
    p_profile_id: profileId, p_event_key: eventKey, p_reason: reason, p_stars: stars,
  });
  if (error) throw error;
  return Number(data || 0);
}
