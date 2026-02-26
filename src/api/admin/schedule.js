import request from '@/utils/request';

// 排课管理
// 取消排课
export const cancelScheduleService = (scheduleId) => {
    return request.delete(`/api/admin/lessons/${scheduleId}/cancel`);
};

// 获取排课列表
export const getScheduleListService = (params) => {
    return request.get('/api/admin/lessons', { params });
};

// 获取排课详情
export const getScheduleDetailService = (scheduleId) => {
    return request.get(`/api/admin/lessons/${scheduleId}`);
};

// 新增排课
// export const createScheduleService = (data) => {
//     return request.post('/api/admin/lessons', data);
// };
export const createScheduleService = (data) => {
    return request.post('/api/admin/lessons', data)
        .then(res => {
            if (res.data.code !== 200) {
                throw new Error(res.data.message || '创建失败')
            }
            return res.data
        })
}

// 新增批量排课
export const batchCreateScheduleService = (data) => {
    return request.post('/api/admin/lessons/batch', data);
};

// 修改排课
export const updateScheduleService = (scheduleId, data) => {
    return request.put(`/api/admin/lessons/${scheduleId}`, data);
};

// 标记课程完成
export const completeScheduleService = (scheduleId) => {
    return request.post(`/api/admin/lessons/${scheduleId}/complete`);
};

// 获取学生列表（空闲）
export const getStudentListService = (params) => {
    return request.get('/api/available-students', { params });
};

// 获取空闲教师列表
export const getAvailableTeacherListService = (params) => {
    return request.get('/api/available-teachers', { params });
};

// 获取课程列表（排课用）
export const getCourseListForScheduleService = (params) => {
    return request.get('/api/courses', { params });
};

// 获取空闲教室列表
export const getAvailableRoomListService = (params) => {
    return request.get('/api/available-rooms', { params });
};