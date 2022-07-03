import request from '@/utils/request'

export function saveDept(data) {
  return request({
    url: '/dept/save',
    method: 'post',
    data
  })
}

export function queryDeptList(data) {
  return request({
    url: '/dept/queryDeptList',
    method: 'post',
    data
  })
}

export function getDeptList() {
  return request({
    url: '/dept/getDeptList',
    method: 'get'
  })
}

/**
 * 获取机构树
 * @returns {*}
 */
export function getDeptTree(id) {
  return request({
    url: '/dept/getDeptTree/' + id,
    method: 'get'
  })
}
