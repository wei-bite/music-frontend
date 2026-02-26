import request from "@/utils/request";

//学习中心仪表盘
export const getStudentDashboardService = () => {
    return request.get('/api/student/dashboard')
}

//我的课表（全部）
export const getStudentCourseListService = (params) => {
    return request.get('/api/student/schedule', { params })
}

//未来课程
export const getStudentUpcomingCourseListService = (params) => {
    return request.get('/api/student/lessons/upcoming', { params })
}

//申请请假
export const applyLeaveService = (data) => {
    return request.post('/api/student/leave', data, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

// 修改请假申请
export const updateLeaveService = (leaveId, data) => {
    return request.put(`/api/student/leave/${leaveId}`, data, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

// 取消请假申请
export const cancelLeaveService = (leaveId) => {
    return request.delete(`/api/student/leave/${leaveId}`)
}

//我的请假记录
export const getMyLeaveRecordsService = (params) => {
    return request.get('/api/student/leaves', { params })
}

// 评价教师
export const submitTeacherRatingService = (data) => {
    return request.post('/api/student/evaluate', data, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

//我的考试成绩
export const getMyExamScoresService = (params) => {
    return request.get('/api/student/exams', { params })
}