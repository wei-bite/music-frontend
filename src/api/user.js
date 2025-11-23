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