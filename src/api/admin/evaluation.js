import request from "@/utils/request";

// 获取评价统计概览
export const getEvaluationOverviewService = () => {
    return request.get('/api/admin/evaluations/overview')
}

// 获取所有教师评价统计（支持排序和筛选）
export const getTeacherEvaluationsService = (params) => {
    return request.get('/api/admin/evaluations/teachers', { params })
}

// 获取指定教师评价详情
export const getTeacherEvaluationDetailService = (teacherId) => {
    return request.get(`/api/admin/evaluations/teachers/${teacherId}`)
}

// 获取评价排行榜
export const getEvaluationRankingService = (params) => {
    return request.get('/api/admin/evaluations/ranking', { params })
}