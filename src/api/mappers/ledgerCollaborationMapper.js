export const mapLedgerMemberDto = (member = {}) => ({
  userId: member.userId,
  username: member.username || '',
  email: member.email || '',
  role: member.role || 'member',
  status: member.status || '',
  joinedAt: member.joinedAt || ''
})

export const mapLedgerInviteDto = (invite = {}) => ({
  id: invite.id,
  ledgerId: invite.ledgerId,
  ledgerName: invite.ledgerName || '',
  invitedByUserId: invite.invitedByUserId ?? null,
  invitedEmail: invite.invitedEmail || '',
  inviteCode: invite.inviteCode || '',
  role: invite.role || 'member',
  status: invite.status || '',
  expiresAt: invite.expiresAt || '',
  acceptedAt: invite.acceptedAt || '',
  createdAt: invite.createdAt || ''
})

export const mapLedgerInvitePayload = (payload = {}) => ({
  invitedEmail: payload.invitedEmail?.trim() || '',
  role: payload.role || 'member',
  expiresInDays: Number(payload.expiresInDays) || 7
})
