import request from '@/utils/request'

// 获取经营仪表盘数据
export const getOperationDashboard = () => {
    return request({
        url: '/api/admin/operation/dashboard',
        method: 'GET'
    })
}

//获取资源使用统计数据
export const getResourceStats = () => {
    return request({
        url: '/api/admin/operation/stats/resources',
        method: 'GET'
    })
}

//获取经营趋势数据
export const getOperationTrends = (days = 7) => {
    return request({
        url: '/api/admin/operation/stats/trends',
        method: 'GET',
        params: { days }
    })
}

//获取财务记录列表
export const getFinancialRecords = (params = {}) => {
    return request({
        url: '/api/admin/operation/financial',
        method: 'GET',
        params
    })
}

// 获取财务记录详情
export const getFinancialRecordDetail = (id) => {
    return request({
        url: `/api/admin/operation/financial/${id}`,
        method: 'GET'
    })
}

/**
 * 创建财务记录
 * @param {Object} data - 请求体
 * @param {'income'|'expense'} data.type - 类型
 * @param {string} data.category - 分类
 * @param {number} data.amount - 金额
 * @param {string} data.recordDate - 记录日期 (yyyy-MM-dd)
 * @param {string} data.description - 描述
 * @param {any} [data.relatedId] - 关联ID（可为 null）
 * @returns {Promise}
 */
export const createFinancialRecord = (data) => {
    return request({
        url: '/api/admin/operation/financial',
        method: 'POST',
        data
    })
}

/**
 * 更新财务记录
 * @param {number|string} id - 财务记录ID
 * @param {Object} data - 同 createFinancialRecord 的 data 结构
 * @returns {Promise}
 */
export const updateFinancialRecord = (id, data) => {
    return request({
        url: `/api/admin/operation/financial/${id}`,
        method: 'PUT',
        data
    })
}

/**
 * 删除财务记录
 * @param {number|string} id - 财务记录ID
 * @returns {Promise}
 */
export const deleteFinancialRecord = (id) => {
    return request({
        url: `/api/admin/operation/financial/${id}`,
        method: 'DELETE'
    })
}

// ========================
// 9~10. 财务统计报表
// ========================

/**
 * 获取财务汇总
 * @returns {Promise}
 */
export const getFinancialSummary = () => {
    return request({
        url: '/api/admin/operation/financial/summary',
        method: 'GET'
    })
}

/**
 * 获取财务分类的收支统计
 * @returns {Promise}
 */
export const getFinancialByCategory = () => {
    return request({
        url: '/api/admin/operation/financial/by-category',
        method: 'GET'
    })
}


//分页查询工资列表
export const getSalaryListService = (params) => {
    return request.get('/api/admin/operation/salaries', { params })
}

//获取工资详情
export const getSalaryDetailService = (id) => {
    return request.get(`/api/admin/operation/salaries/${id}`)
}

//新增工资记录
export const createSalaryService = (data) => {
    return request.post('/api/admin/operation/salaries', data)
}

//修改工资记录
export const updateSalaryService = (id, data) => {
    return request.put(`/api/admin/operation/salaries/${id}`, data)
}

// 删除工资记录
export const deleteSalaryService = (id) => {
    return request.delete(`/api/admin/operation/salaries/${id}`)
}

//发放工资
export const distributeSalaryService = (id) => {
    return request.put(`/api/admin/operation/salaries/${id}/pay`)
}

// 获取所有教师列表（下拉选择）
export const getAllTeachersService = () => {
    return request.get('/api/admin/operation/teachers')
}