import { supabase } from '../supabaseClient'
import { computeBalances, computeDailyTotalsForUser } from './settlement'

// Shared by GroupSettings' member-list "Leave"/"Remove" and the Settings
// page's Groups section "Leave group" — both need to freeze a balance and
// daily-totals snapshot via remove_group_member() before the membership
// disappears, so stats for that group survive after its bills stop being
// queryable. Pulled out here rather than duplicated so the two entry
// points can never quietly drift apart.
//
// `member` is a fetchAllGroupMembers()-shaped row ({ id, userId, ... }) —
// `id` is the group_members.id being removed, `userId` is null for a
// guest. `categories` only needs `id`/`name`, just enough to resolve each
// bill/item's effective category down to a name for the frozen snapshot.
export async function snapshotAndRemoveMember({ groupId, groupName, member, categories }) {
  const { data: billsData, error: billsError } = await supabase
    .from('bills')
    .select(
      'id, paid_by, created_at, category_id, items(id, total_price, category_id, item_shares(member_id, shares)), bill_payers(member_id, amount)'
    )
    .eq('group_id', groupId)
  if (billsError) throw new Error(billsError.message)

  const bills = (billsData || []).map((b) => ({
    id: b.id,
    paid_by: b.paid_by,
    created_at: b.created_at,
    category_id: b.category_id,
    payers: b.bill_payers || [],
  }))
  const items = []
  const itemShares = []
  for (const bill of billsData || []) {
    for (const item of bill.items || []) {
      items.push({ id: item.id, bill_id: bill.id, total_price: item.total_price, category_id: item.category_id })
      for (const share of item.item_shares || []) {
        itemShares.push({ item_id: item.id, user_id: share.member_id, shares: share.shares })
      }
    }
  }

  const { data: paymentsData, error: paymentsError } = await supabase
    .from('payments')
    .select('from_member, to_member, amount')
    .eq('group_id', groupId)
  if (paymentsError) throw new Error(paymentsError.message)

  const paymentsForBalances = (paymentsData || []).map((p) => ({
    from_user: p.from_member,
    to_user: p.to_member,
    amount: p.amount,
  }))

  const balances = computeBalances({ bills, items, itemShares, payments: paymentsForBalances })
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]))
  const dailyTotals = computeDailyTotalsForUser(member.id, { bills, items, itemShares, categoryNameById })

  const { error } = await supabase.rpc('remove_group_member', {
    target_group_id: groupId,
    target_user_id: member.userId,
    group_name: groupName,
    snapshot_balance: balances[member.id] || 0,
    snapshot_daily: dailyTotals,
  })
  if (error) throw new Error(error.message)
}
