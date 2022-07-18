import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/user/doLogin',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function saveUser(data) {
  return request({
    url: '/user/save',
    method: 'post',
    data
  })
}

export function queryUserList(data) {
  return request({
    url: '/user/queryUserList',
    method: 'post',
    data
  })
}

export function validateUsernameRepeat(username) {
  return request({
    url: '/user/validateUsernameRepeat',
    method: 'get',
    params: {
      username: username
    }
  })
}

export function deleteUser(id) {
  return request({
    url: '/user/deleteUser',
    method: 'get',
    params: {
      id: id
    }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}
