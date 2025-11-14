import request from "@/utils/request";

//登录接口
export const userLoginService = ({ username, password, role }) => {
    return request.post('/api/user/login', { username, password, role })
}