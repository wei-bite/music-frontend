import request from "@/utils/request";
//获取管理员仪表盘
export const getAdminDashboardService = () => {
    return request.get('/api/admin/operation/dashboard')
}

//获取经济趋势数据
export const getAdminEconomicTrendService = (params) => {
    return request.get('/api/admin/operation/stats/trends', { params })
}

//课程管理
// 获取课程列表
export const getCourseListService = (params) => {
    return request.get('/api/admin/courses', { params })
}

// 获取课程详情
export const getCourseDetailService = (courseId) => {
    return request.get(`/api/admin/courses/${courseId}`)
}

// 创建课程
export const createCourseService = (data) => {
    return request.post('/api/admin/courses', data)
}

// 更新课程
export const updateCourseService = (courseId, data) => {
    return request.put(`/api/admin/courses/${courseId}`, data)
}

// 删除课程
export const deleteCourseService = (courseId) => {
    return request.delete(`/api/admin/courses/${courseId}`)
}

//获取删除课程列表
export const getDeletedCourseListService = (params) => {
    return request.get('/api/admin/courses/deleted', { params })
}

//恢复课程
export const restoreCourseService = (courseId) => {
    return request.post(`/api/admin/courses/${courseId}/restore`)
}

