import request from '@/utils/request'

export function getList(params) {
  return request({
    url: '/sharing-platform-web/table/list',
    method: 'get',
    params
  })
}
