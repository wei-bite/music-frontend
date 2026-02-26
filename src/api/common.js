import request from "@/utils/request";
//老师和学生端通用接口

//用户申请琴房预约
export const applyPracticeRoomService = (data) => {
    return request.post('/api/user/reservations/apply', data, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

//查看我的预约
export const getMyReservationsService = (params) => {
    return request.get('/api/user/reservations', { params })
}

//查看公告
export const getAnnouncementsService = (params) => {
    return request.get('/api/user/announcements', { params })
}

//租借乐器
export const rentInstrumentService = (modelId, data) => {
    return request.post(`/api/user/instruments/${modelId}/rent`, data)
}

//归还乐器
export const returnInstrumentService = (rentalId) => {
    return request.post(`/api/user/instruments/${rentalId}/return`)
}

//我的租借列表
export const getMyRentalsService = (params) => {
    return request.get('/api/user/instruments/my-rentals', { params })
}

//购买乐器
export const buyInstrumentService = (modelId, data) => {
    return request.post(`/api/user/instruments/${modelId}/purchase`, data)
}