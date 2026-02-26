import request from "@/utils/request";

//获取公告列表
export const getAnnouncementsService = (params) => {
    return request.get('/api/admin/announcements', { params })
}

//创建公告
export const createAnnouncementService = (data) => {
    return request.post('/api/admin/announcements', data)
}

//更新公告
export const updateAnnouncementService = (announcementId, data) => {
    return request.put(`/api/admin/announcements/${announcementId}`, data)
}

//删除公告
export const deleteAnnouncementService = (announcementId) => {
    return request.delete(`/api/admin/announcements/${announcementId}`)
}

//获取公告详情
export const getAnnouncementDetailService = (announcementId) => {
    return request.get(`/api/admin/announcements/${announcementId}`)
}