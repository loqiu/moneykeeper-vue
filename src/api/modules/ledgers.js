import request from '@/utils/axios'
import { unwrapMkApiResponse } from '@/api/response'
import {
  mapLedgerInviteDto,
  mapLedgerInvitePayload,
  mapLedgerMemberDto
} from '@/api/mappers/ledgerCollaborationMapper'

const mapMemberList = (payload) => {
  return Array.isArray(payload) ? payload.map(mapLedgerMemberDto) : []
}

const mapInviteList = (payload) => {
  return Array.isArray(payload) ? payload.map(mapLedgerInviteDto) : []
}

export const fetchLedgers = async () => {
  const response = await request.get('/ledgers')
  return unwrapMkApiResponse(response, '获取账本列表失败', { allowUndefinedData: true }) || []
}

export const fetchDefaultLedger = async () => {
  const response = await request.get('/ledgers/default')
  return unwrapMkApiResponse(response, '获取默认账本失败', { allowUndefinedData: true }) || null
}

export const createLedger = async (payload) => {
  const response = await request.post('/ledgers', payload)
  return unwrapMkApiResponse(response, '创建账本失败')
}

export const fetchLedgerMembers = async (ledgerId) => {
  const response = await request.get(`/ledgers/${ledgerId}/members`)
  return mapMemberList(unwrapMkApiResponse(response, '获取账本成员失败', { allowUndefinedData: true }) || [])
}

export const createLedgerInvite = async (ledgerId, payload) => {
  const response = await request.post(`/ledgers/${ledgerId}/invites`, mapLedgerInvitePayload(payload))
  return mapLedgerInviteDto(unwrapMkApiResponse(response, '创建邀请失败'))
}

export const fetchLedgerInvites = async (ledgerId) => {
  const response = await request.get(`/ledgers/${ledgerId}/invites`)
  return mapInviteList(unwrapMkApiResponse(response, '获取邀请列表失败', { allowUndefinedData: true }) || [])
}

export const fetchMyLedgerInvites = async () => {
  const response = await request.get('/ledgers/invites')
  return mapInviteList(unwrapMkApiResponse(response, '获取待接受邀请失败', { allowUndefinedData: true }) || [])
}

export const acceptLedgerInvite = async (inviteCode) => {
  const response = await request.post(`/ledgers/invites/${inviteCode}/accept`)
  return unwrapMkApiResponse(response, '接受邀请失败')
}
