import request from '@/utils/request'

/**
 * 租借统计信息接口
 */
export const getRentalStatisticsService = () => {
  return request.get('/api/admin/instruments/rental-statistics')
}

/**
 * 即将到期租借列表接口
 */
export const getExpiringRentalsListService = (params) => {
  return request.get('/api/admin/instruments/expiring-rentals', { params })
}

/**
 * 逾期租借列表接口
 */
export const getOverdueRentalsListService = () => {
  return request.get('/api/admin/instruments/overdue-rentals')
}

/**
 * 发送逾期提醒接口
 */
export const sendOverdueNoticeService = (instrumentId) => {
  return request.post(`/api/admin/instruments/${instrumentId}/send-overdue-notice`)
}

/**
 * 批量审批租借申请接口
 */
export const batchApproveRentalsService = (instrumentIds) => {
  return request.post('/api/admin/instruments/batch-approve', instrumentIds)
}

/**
 * 批量拒绝租借申请接口
 */
export const batchRejectRentalsService = (instrumentIds) => {
  return request.post('/api/admin/instruments/batch-reject', instrumentIds)
}