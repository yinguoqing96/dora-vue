import request from '@/utils/request'

export function saveMenu(data) {
  return request({
    url: '/menu/save',
    method: 'post',
    data
  })
}

export function queryMenuList(data) {
  return request({
    url: '/menu/queryMenuList',
    method: 'post',
    data
  })
}

export function deleteMenu(id) {
  return request({
    url: '/menu/deleteMenu',
    method: 'get',
    params: {
      id: id
    }
  })
}
