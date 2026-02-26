import request from "@/utils/request";

// 分页查询乐器型号列表
export const getInstrumentsService = (params) => {
    return request.get('/api/admin/instruments/models', { params })
}

// 获取乐器型号类型
export const getInstrumentTypesService = () => {
    return request.get('/api/admin/instruments/types')
}

//上传乐器封面
export const uploadInstrumentCoverService = (id, file) => {
    const formData = new FormData()
    formData.append('file', file)

    return request({
        url: `/api/admin/instruments/models/${id}/cover`,
        method: 'POST',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data' // Axios 通常会自动设置，但显式声明更安全
        }
    })
}

//获取型号统计信息
export const getInstrumentStatsService = (modelId) => {
    return request.get(`/api/admin/instruments/models/${modelId}/stats`)
}

//创建乐器型号
export const createInstrumentModelService = (data) => {
    return request.post('/api/admin/instruments/models', data)
}

//更新乐器型号
export const updateInstrumentModelService = (modelId, data) => {
    return request.put(`/api/admin/instruments/models/${modelId}`, data)
}

//删除乐器型号
export const deleteInstrumentModelService = (modelId) => {
    return request.delete(`/api/admin/instruments/models/${modelId}`)
}

//批量添加乐器实物（入库）
export const addInstrumentsService = (modelId, count) => {
    return request.post('/api/admin/instruments/batch-add', { modelId, count })
}

//获取待审批租借申请列表
export const getPendingRentalsService = (params) => {
    return request.get('/api/admin/instruments/pending', { params })
}

//批准租借申请
export const approveRentalService = (instrumentId) => {
    return request.put(`/api/admin/instruments/${instrumentId}/approve`)
}

//拒绝租借申请
export const rejectRentalService = (instrumentId) => {
    return request.put(`/api/admin/instruments/${instrumentId}/reject`)
}

//获取已租出乐器列表
export const getRentedInstrumentsService = (params) => {
    return request.get('/api/admin/instruments/rented', { params })
}


//获取已售出乐器列表
export const getSoldInstrumentsService = (params) => {
    return request.get('/api/admin/instruments/sold', { params })
}

//强制归还乐器
export const forceReturnInstrumentService = (instrumentId) => {
    return request.post(`/api/admin/instruments/${instrumentId}/force-return`)
}

//售卖乐器
export const sellInstrumentService = (instrumentId) => {
    return request.post(`/api/admin/instruments/${instrumentId}/sell`)
}