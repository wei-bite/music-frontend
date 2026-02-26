import request from '@/utils/request';

// 获取琴房列表
export const getPracticeRoomListService = (params) => {
    return request.get('/api/admin/practice-rooms', { params });
};

// 新增琴房
export const createPracticeRoomService = (data) => {
    return request.post('/api/admin/practice-rooms', data);
};

// 修改琴房
export const updatePracticeRoomService = (roomId, data) => {
    return request.put(`/api/admin/practice-rooms/${roomId}`, data);
};

// 删除琴房
export const deletePracticeRoomService = (roomId) => {
    return request.delete(`/api/admin/practice-rooms/${roomId}`);
};

//获取待审核预约列表
export const getPendingReservationsService = (params) => {
    return request.get('/api/admin/practice-rooms/pending', { params });
}

//审核通过预约
export const approveReservationService = (data) => {
    return request.post('/api/admin/practice-rooms/approve', data);
}


//审核拒绝预约
export const rejectReservationService = (data) => {
    return request.post('/api/admin/practice-rooms/reject', data);
}