import request from "@/utils/request";

//获取教师仪表盘
export const getTeacherDashboardService = () => {
    return request.get('/api/teacher/dashboard')
}

//获取教师我的课表（所以）
export const getTeacherCourseListService = (params) => {
    return request.get('/api/teacher/schedule', { params })
}


//获取教师未来课程
export const getTeacherUpcomingCourseListService = (params) => {
    return request.get('/api/teacher/lessons/upcoming', { params })
}

//查询我的所有考勤记录
export const getMyAttendanceRecordsService = (params) => {
    return request.get('/api/teacher/attendance/list', { params })
}


// 查询某课节的考勤记录
export const getLessonAttendanceRecordsService = (lessonId) => {
    return request.get(`/api/teacher/attendance/lesson/${lessonId}`)
}

//添加考勤记录
export const addAttendanceRecordService = (data) => {
    return request.post('/api/teacher/attendance', data)
}

// 修改考勤记录
export const updateAttendanceRecordService = (recordId, data) => {
    return request.put(`/api/teacher/attendance/${recordId}`, data)
}

//删除考勤记录
export const deleteAttendanceRecordService = (recordId) => {
    return request.delete(`/api/teacher/attendance/${recordId}`)
}


//工资明细
export const getSalaryService = (params) => {
    return request.get('/api/teacher/salary', { params })
}

//待请假列表
export const getLeaveRequestsService = (params) => {
    return request.get('/api/teacher/student-leaves', { params })
}

//审批学生请假
export const approveLeaveRequestService = (leaveId, status) => {
    return request.put(`/api/teacher/student-leaves/${leaveId}`, null, { params: { status } })
}

//考试打分
export const submitExamScoreService = (data) => {
    return request.post('/api/teacher/exam/grade', data)
}

//考试记录历史
export const getExamHistoryService = (params) => {
    return request.get('/api/teacher/exam/history', { params })
}

//按学生查询考试记录
export const getExamHistoryByStudentService = (studentId) => {
    return request.get(`/api/teacher/exam/student/${studentId}`)
}

//查询考试记录详情
export const getExamDetailService = (examId) => {
    return request.get(`/api/teacher/exam/${examId}`)
}

//更新考试记录
export const updateExamService = (examId, data) => {
    return request.put(`/api/teacher/exam/${examId}`, data)
}

//删除考试记录
export const deleteExamService = (examId) => {
    return request.delete(`/api/teacher/exam/${examId}`)
}

//获取教师的学生列表
export const getMyStudentsService = (params) => {
    return request.get('/api/teacher/students', { params })
}