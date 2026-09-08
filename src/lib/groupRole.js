// One combined fetch for "what does this group look like, and what can I
// do here" — the group's own name/is_personal/admin_id plus my own
// participant id in it (if any), needed by every Group Settings section
// that gates an admin-only action (Guests' "Delete permanently", the whole
// Danger Zone) or just needs the group's own name for a confirmation. Kept
// as one shared place rather than re-derived independently everywhere,
// though a couple of callers skip it deliberately: Members/Guests already
// fetch the full member roster for their own list, so deriving "am I the
// admin" from that (same as this file does internally) costs them nothing
// extra — this is for the sections that don't otherwise need the roster.
export async function fetchGroupRole(supabase, groupId, userId) {
  const [{ data: group }, { data: memberRow }] = await Promise.all([
    supabase.from('groups').select('name, is_personal, admin_id').eq('id', groupId).single(),
    supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .eq('active', true)
      .maybeSingle(),
  ])

  const myParticipantId = memberRow?.id || null
  return {
    name: group?.name || '',
    isPersonal: group?.is_personal || false,
    adminId: group?.admin_id || null,
    myParticipantId,
    isAdmin: Boolean(myParticipantId) && myParticipantId === group?.admin_id,
  }
}
