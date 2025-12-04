import request from "@/utils/request";

// 注册接口
export const userRegisterService = ({ username, password }) => {
    return request.post('/api/user/register', { username, password })
}

//登录接口
export const userLoginService = ({ username, password, role }) => {
    return request.post('/api/user/login', { username, password, role })
}

//获取用户信息
export const userGetInfoService = () => {
    return request.get('/api/user/profile')
}

//更新用户信息
export const userUpdateInfoService = (data) => {
    return request({
        url: '/api/user/profile/update',
        method: 'post',
        data
    })
}

//上传用户头像
export const userUploadAvatarService = (file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return request({
        url: '/api/user/avatar/update',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

//用户密码更新
export const userUpdatePasswordService = ({ old_pwd, new_pwd, re_pwd }) => {
    return request.post('/api/user/password/change', { old_pwd, new_pwd, re_pwd })
}

//获取用户列表
export const userGetListService = (params) => {
    return request.get('/api/admin/users', { params })
}

//创建用户
export const userCreateService = (data) => {
    return request.post('/api/admin/users/register', data)
}

//修改用户信息
export const userUpdateService = (id, data) => {
    return request.put(`/api/admin/users/${id}`, data)
}

//删除用户
export const userDeleteService = (id) => {
    return request.delete(`/api/admin/users/${id}`)
}

//获取用户详情
export const userGetDetailService = (id) => {
    return request.get(`/api/admin/users/${id}`)
}

// 重置用户密码
export const userResetPasswordService = (id) => {
    return request.put(`/api/admin/users/${id}/reset-password`)
}