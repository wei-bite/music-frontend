import request from '@/utils/request'

/**
 * 检查租借资格接口
 */
export const checkRentalEligibilityService = () => {
  return request.get('/api/user/instruments/check-rental-eligibility')
}

/**
 * 获取租借申请历史接口
 */
export const getRentalApplicationHistoryService = () => {
  return request.get('/api/user/instruments/rental-applications')
}

/**
 * 获取即将到期租借接口
 */
export const getExpiringRentalsService = () => {
  return request.get('/api/user/instruments/expiring-rentals')
}