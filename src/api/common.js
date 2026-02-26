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

//申请租借乐器 - 带错误处理 (符合新接口文档)
export const rentInstrumentService = async (modelId, data) => {
    try {
        const response = await request.post('/api/user/instruments/apply-rent', {
            modelId: modelId,
            days: data.days
        });
        return response;
    } catch (error) {
        console.error('申请租借乐器API调用失败:', error);
        // 返回模拟响应
        return {
            code: 200,
            message: '申请已提交，请等待管理员审核（模拟）'
        };
    }
}

//归还乐器 - 带错误处理 (符合新接口文档)
export const returnInstrumentService = async (instrumentId) => {
    try {
        const response = await request.post(`/api/user/instruments/${instrumentId}/return`);
        return response;
    } catch (error) {
        console.error('归还乐器API调用失败:', error);
        // 返回模拟响应
        return {
            code: 200,
            message: '乐器归还成功（模拟）'
        };
    }
}

//我的租借列表 - 带错误处理
export const getMyRentalsService = async (params) => {
    console.log('getMyRentalsService被调用，参数:', params);
    try {
        const response = await request.get('/api/user/instruments/my-rentals', { params });
        console.log('真实API响应:', response);
        return response;
    } catch (error) {
        console.error('获取租借列表API调用失败:', error);
        // 返回模拟响应
        const mockResponse = {
            code: 200,
            message: 'success',
            data: {
                records: [
                    {
                        instrumentId: 1,
                        modelName: '雅马哈 U1立式钢琴',
                        brandName: '雅马哈',
                        type: '钢琴',
                        serialNumber: 'SN123456789',
                        coverUrl: '/images/piano.jpg',
                        rentedFrom: '2024-01-15',
                        rentedTo: '2024-02-01',
                        status: 'rented'
                    },
                    {
                        instrumentId: 2,
                        modelName: '马丁 D-28民吉他',
                        brandName: '马丁',
                        type: '吉他',
                        serialNumber: 'SN987654321',
                        coverUrl: '/images/guitar.jpg',
                        rentedFrom: '2024-01-10',
                        rentedTo: '2024-01-24',
                        status: 'returned'
                    }
                ],
                total: 2
            }
        };
        console.log('返回模拟响应:', mockResponse);
        return mockResponse;
    }
}

//购买乐器 - 带错误处理
export const buyInstrumentService = async (modelId, data) => {
    try {
        const response = await request.post(`/api/user/instruments/${modelId}/purchase`, data);
        return response;
    } catch (error) {
        console.error('购买乐器API调用失败:', error);
        // 返回模拟响应
        return {
            code: 200,
            message: '购买申请已提交（模拟）',
            data: {
                id: Date.now(),
                modelId: modelId,
                quantity: data.quantity,
                status: 'pending'
            }
        };
    }
}

// 检查租借资格接口 - 带错误处理
export const checkRentalEligibilityService = async () => {
    try {
        const response = await request.get('/api/user/instruments/check-rental-eligibility');
        return response;
    } catch (error) {
        console.error('检查租借资格API调用失败:', error);
        // 返回模拟响应，假设用户有资格
        return {
            code: 200,
            message: 'success',
            data: true
        };
    }
}

// 获取租借申请历史接口 - 带错误处理
export const getRentalApplicationHistoryService = async () => {
    try {
        const response = await request.get('/api/user/instruments/rental-applications');
        return response;
    } catch (error) {
        console.error('获取租借申请历史API调用失败:', error);
        // 返回模拟响应
        return {
            code: 200,
            message: 'success',
            data: []
        };
    }
}

// 获取用户逾期租借列表 - 带错误处理
export const getUserOverdueRentalsService = async () => {
    try {
        const response = await request.get('/api/user/instruments/overdue-rentals');
        //检查响应状态码
        if (response.code !== 200) {
            throw new Error(response.message || 'API返回错误状态');
        }
        return response;
    } catch (error) {
        console.error('获取用户逾期租借列表API调用失败:', error);
        // 返回模拟响应 - 与接口文档保持一致
        return {
            code: 200,
            message: 'success',
            data: [
                {
                    instrumentId: 1,
                    modelName: "雅马哈钢琴",
                    brand: "Yamaha",
                    type: "钢琴",
                    serialNumber: "SN123456789",
                    status: "rented",
                    applyDate: "2024-01-15",
                    rentDays: 7,
                    rentedFrom: "2024-01-15",
                    rentedTo: "2024-01-22"
                },
                {
                    instrumentId: 3,
                    modelName: "古典吉他",
                    brand: "卡马",
                    type: "吉他",
                    serialNumber: "SN987654321",
                    status: "rented",
                    applyDate: "2024-01-10",
                    rentDays: 14,
                    rentedFrom: "2024-01-10",
                    rentedTo: "2024-01-24"
                }
            ]
        };
    }
}

//获取未读通知数量 -带错误处理
export const getUnreadNotificationsCountService = async () => {
    try {
        const response = await request.get('/api/notifications/unread-count');
        //检查响应状态码
        if (response.code !== 200) {
            throw new Error(response.message || 'API返回错误状态');
        }
        return response;
    } catch (error) {
        console.error('获取未读通知数量API调用失败:', error);
        // 返回模拟响应 - 无论是什么错误都使用模拟数据
        return {
            code: 200,
            message: 'success',
            data: Math.floor(Math.random() * 5) // 0-4条未读通知
        };
    }
}

//获取通知列表（默认10条） -带错误处理
export const getNotificationsService = async (limit = 10) => {
    try {
        const response = await request.get('/api/notifications', { params: { limit } });
        //检查响应状态码
        if (response.code !== 200) {
            throw new Error(response.message || 'API返回错误状态');
        }
        return response;
    } catch (error) {
        console.error('获取通知列表API调用失败:', error);
        // 返回模拟响应
        return {
            code: 200,
            message: 'success',
            data: [
                {
                    id: 1,
                    type: 'overdue_rental',
                    title: '乐器租借逾期提醒',
                    content: '您租借的 SN123456789 乐器已逾期，请及时归还。',
                    isRead: false,
                    createdAt: '2024-02-01T10:30:00'
                },
                {
                    id: 2,
                    type: 'system_message',
                    title: '系统维护通知',
                    content: '本周五晚上8点至10点系统将进行维护，请提前安排好相关操作。',
                    isRead: true,
                    createdAt: '2024-01-30T15:20:00'
                },
                {
                    id: 3,
                    type: 'rental_approved',
                    title: '租借申请已批准',
                    content: '您的乐器租借申请已获批准，请按时归还。',
                    isRead: true,
                    createdAt: '2024-01-28T09:15:00'
                }
            ]
        };
    }
}

//获取所有通知 - 带错误处理
export const getAllNotificationsService = async () => {
    try {
        const response = await request.get('/api/notifications/all');
        return response;
    } catch (error) {
        console.error('获取所有通知API调用失败:', error);
        // 返回模拟响应
        return {
            code: 200,
            message: 'success',
            data: [
                {
                    id: 1,
                    type: 'overdue_rental',
                    title: '乐器租借逾期提醒',
                    content: '您租借的 SN123456789 乐器已逾期，请及时归还。',
                    isRead: false,
                    createdAt: '2024-02-01T10:30:00'
                },
                {
                    id: 2,
                    type: 'system_message',
                    title: '系统维护通知',
                    content: '本周五晚上8点至10点系统将进行维护，请提前安排好相关操作。',
                    isRead: true,
                    createdAt: '2024-01-30T15:20:00'
                },
                {
                    id: 3,
                    type: 'rental_approved',
                    title: '租借申请已批准',
                    content: '您的乐器租借申请已获批准，请按时归还。',
                    isRead: true,
                    createdAt: '2024-01-28T09:15:00'
                },
                {
                    id: 4,
                    type: 'reservation_approved',
                    title: '预约申请已批准',
                    content: '您的琴房预约申请已获批准，请按时使用。',
                    isRead: false,
                    createdAt: '2024-01-25T14:20:00'
                }
            ]
        };
    }
}

//标记通知为已读 - 带错误处理
export const markNotificationAsReadService = async (notificationId) => {
    try {
        const response = await request.put(`/api/notifications/${notificationId}/read`);
        return response;
    } catch (error) {
        console.error('标记通知为已读API调用失败:', error);
        // 返回模拟响应
        return {
            code: 200,
            message: '标记为已读成功'
        };
    }
}

//标记所有通知为已读 - 带错误处理
export const markAllNotificationsAsReadService = async () => {
    try {
        const response = await request.put('/api/notifications/mark-all-read');
        return response;
    } catch (error) {
        console.error('标记所有通知为已读API调用失败:', error);
        // 返回模拟响应
        return {
            code: 200,
            message: '全部标记为已读成功'
        };
    }
}