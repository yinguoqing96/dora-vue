<template>
  <div class="app-container">
    <!-- 组织机构树 -->
    <el-row :gutter="20">
      <el-col :span="4">
        <el-input
          v-model="deptTreeFilterText"
          placeholder="输入关键字进行过滤"
        />

        <el-tree
          ref="deptTreeRef"
          class="filter-tree"
          :data="deptTree"
          node-key="id"
          :props="{
            children: 'children',
            label: 'deptName'
          }"
          :filter-node-method="deptTreeFilterNode"
          highlight-current
          @node-click="deptTreeClick"
        />
      </el-col>
      <el-col :span="20">
        <!-- 查询 -->
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="用户名：">
            <el-input v-model="searchForm.username" placeholder="请输入"/>
          </el-form-item>
          <el-form-item label="姓名：">
            <el-input v-model="searchForm.realName" placeholder="请输入"/>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="search">查询</el-button>
            <el-button type="primary" @click="openSaveUserDialogForm">创建</el-button>
          </el-form-item>
        </el-form>

        <!-- 列表 -->
        <el-table :data="tableData" border style="width: 100%">
          <!--          <el-table-column fixed prop="avatar" label="头像" width="80px">-->
          <!--            <template v-slot="scope">-->
          <!--              <el-avatar :size="50" :src="scope.row.avatar"></el-avatar>-->
          <!--            </template>-->
          <!--          </el-table-column>-->
          <el-table-column align="center" fixed label="用户名" prop="username"/>
          <el-table-column align="center" label="姓名" prop="realName"/>
          <el-table-column align="center" label="组织机构" prop="deptName"/>
          <el-table-column align="center" label="手机号" prop="phone"/>
          <el-table-column align="center" label="邮箱" prop="email"/>
          <el-table-column prop="status" label="状态" width="80px" align="center">
            <template v-slot="scope">
              <el-switch
                v-model="scope.row.status"
                active-color="#13ce66"
                inactive-color="#ff4949"
              />
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="150" align="center">
            <template v-slot="scope">
              <el-button circle class="el-icon-edit" size="mini" type="primary"
                         @click="openSaveUserDialogForm(scope.row)"
              />
              <el-button circle class="el-icon-delete" size="mini" type="danger" @click="delUser(scope.row)"/>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页插件 -->
        <el-pagination
          v-show="tableDataTotal > 10"
          :current-page="searchForm.pageNumber"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="searchForm.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tableDataTotal"
          @size-change="handlePaginationSizeChange"
          @current-change="handlePaginationCurrentChange"
        />
      </el-col>
    </el-row>

    <!-- 创建/修改用户 -->
    <el-dialog
      :title="saveUserDialogFormTitle"
      :visible.sync="saveUserDialogFormVisible"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      width="30%"
      center
      @close="closeSaveUserDialogFormVisible"
    >
      <el-form ref="saveUserFormRef" :model="saveUserForm" :rules="saveUserFormRules" status-icon>
        <div class="block" style="text-align: center; margin-bottom: 20px">
          <el-upload
            ref="uploadAvatar"
            action="/dev-api/user/uploadAvatar"
            :headers="uploadAvatarHeader"
            name="avatarFile"
            :show-file-list="false"
            :limit="1"
            :before-upload="beforeAvatarUpload"
            :on-success="uploadAvatarSuccess"
            :on-error="uploadAvatarError"
          >
            <el-avatar :size="80" :src="saveUserForm.avatar" @error="errorAvatarHandler">
              <el-link icon="el-icon-edit">{{ saveUserAvatarTitle }}</el-link>
            </el-avatar>
          </el-upload>
        </div>
        <el-divider/>
        <el-form-item label="用户名" label-width="120px" prop="username">
          <el-input v-model="saveUserForm.username" style="width: 80%"/>
        </el-form-item>
        <el-form-item v-show="!saveUserForm.id" label="密码" label-width="120px" prop="password">
          <el-input v-model="saveUserForm.password" show-password style="width: 80%"/>
        </el-form-item>
        <el-form-item label="姓名" label-width="120px" prop="realName">
          <el-input v-model="saveUserForm.realName" style="width: 80%"/>
        </el-form-item>
        <el-form-item label="组织部门" label-width="120px" prop="deptName">
          <el-input v-model="saveUserForm.deptName" disabled style="width: 80%"/>
        </el-form-item>
        <el-form-item label="手机号" label-width="120px">
          <el-input v-model="saveUserForm.phone" style="width: 80%"/>
        </el-form-item>
        <el-form-item label="邮箱" label-width="120px">
          <el-input v-model="saveUserForm.emailPrefix" class="input-with-select" style="width: 80%">
            <el-select slot="append" v-model="saveUserForm.emailSuffix">
              <el-option label="@icloud.com" value="@icloud.com"/>
              <el-option label="@163.com" value="@163.com"/>
              <el-option label="@126.com" value="@126.com"/>
            </el-select>
          </el-input>
        </el-form-item>
        <el-form-item label="状态" label-width="120px">
          <el-switch
            v-model="saveUserForm.status"
            active-color="#13ce66"
            inactive-color="#ff4949"
            style="width: 200px"
          />
        </el-form-item>
        <el-divider/>
        <el-form-item style="text-align: center; margin-top: 30px">
          <el-button style="margin-right: 30px" @click="closeSaveUserDialogFormVisible">取消</el-button>
          <el-button type="primary" @click="saveUser">保存</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { AUTHOR_KEY } from '@/global'
import { getToken } from '@/utils/auth'
import { deleteUser, queryUserList, saveUser, validateUsernameRepeat } from '@/api/system/user'
import { getDeptTree } from '@/api/system/dept'

export default {
  name: 'User',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入用户名'))
      } else if (value.length < 5 || value.length > 20) {
        return callback(new Error('长度在 5 到 20 个字符'))
      } else {
        // 校验用户名重复
        validateUsernameRepeat(this.saveUserForm.username).then(res => {
          this.resCode = res.code
        })

        if (this.resCode === 201) {
          return callback(new Error('用户名已存在'))
        } else {
          callback()
        }
      }
    }
    return {
      searchForm: {
        deptId: undefined,
        username: undefined,
        realName: undefined,
        pageNumber: 1,
        pageSize: 10
      },
      tableData: [],
      tableDataTotal: 0,
      deptTree: [],
      deptTreeFilterText: '',
      deptList: [],
      avatarRedisKey: undefined,
      saveUserAvatarTitle: '上传',
      saveUserDialogFormTitle: '创建用户',
      saveUserDialogFormVisible: false,
      saveUserForm: {
        id: undefined,
        avatar: undefined,
        username: undefined,
        password: undefined,
        realName: undefined,
        deptId: undefined,
        deptName: undefined,
        phone: undefined,
        email: undefined,
        emailPrefix: undefined,
        emailSuffix: '@icloud.com',
        status: true
      },
      saveUserFormRules: {
        username: [
          { required: true, validator: validateUsername, trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 5, max: 20, message: '长度在 5 到 20 个字符', trigger: 'blur' }
        ],
        realName: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ]
      },
      resMsg: undefined,
      resCode: undefined
    }
  },
  computed: {
    uploadAvatarHeader() {
      return {
        // 设置Content-Type类型为multipart/form-data
        'ContentType': 'multipart/form-data; charset=utf-8',
        [AUTHOR_KEY]: 'Bearer ' + getToken()
      }
    }
  },
  watch: {
    deptTreeFilterText(val) {
      this.$refs.deptTreeRef.filter(val)
    }
  },
  created() {
    this.queryTableList()
    this.getDeptTree()
  },
  methods: {
    getDeptTree() {
      this.deptTree = []
      const parentTree = {
        id: '0',
        deptName: '全部',
        deptCode: '0',
        parent_id: '0',
        cascade: '0',
        children: []
      }
      getDeptTree(parentTree.id).then(res => {
        if (res.code === 200) {
          parentTree.children = res.data
        }
      })
      this.deptTree.push(parentTree)
    },
    deptTreeFilterNode(value, data) {
      if (!value) return true
      return data.deptName.indexOf(value) !== -1
    },
    deptTreeClick(data) {
      this.saveUserForm.deptId = data.id
      this.saveUserForm.deptName = data.deptName
      this.searchForm.deptId = data.id === '0' ? null : data.id
      this.search()
    },
    search() {
      this.searchForm.pageNumber = 1
      this.queryTableList()
    },
    handlePaginationSizeChange(val) {
      this.searchForm.pageSize = val
      this.queryTableList()
    },
    handlePaginationCurrentChange(val) {
      this.searchForm.pageNumber = val
      this.queryTableList()
    },
    queryTableList() {
      queryUserList(this.searchForm).then(res => {
        this.tableData = res.data.records
        this.tableDataTotal = res.data.total
      })
    },
    saveUser() {
      // 创建/修改用户
      // 邮箱合并
      if (this.saveUserForm.emailPrefix) {
        this.saveUserForm.email = this.saveUserForm.emailPrefix + this.saveUserForm.emailSuffix
      }
      saveUser(this.saveUserForm).then(res => {
        if (res.code === 200) {
          this.$message({
            message: this.saveUserDialogFormTitle + '成功!',
            type: 'success'
          })
        }
        this.saveUserDialogFormVisible = false
        this.queryTableList()
      }).catch(() => {
        this.$message({
          message: '服务器内部错误！',
          type: 'error'
        })
      }).finally(
        this.$refs.saveUserFormRef.clearValidate()
      )
    },
    delUser(user) {
      const id = user.id
      deleteUser(id).then(res => {
        if (res.code === 200) {
          this.$message({
            message: '删除成功!',
            type: 'success'
          })
        } else {
          this.$message({
            message: '删除失败!',
            type: 'error'
          })
        }
      }).catch(() => {
        this.$message({
          message: '服务器内部错误!',
          type: 'error'
        })
      }).finally(
        this.search()
      )
    },
    openSaveUserDialogForm(user) {
      if (user && user.id) {
        // 修改
        // this.$set(this, 'saveUserForm', user)
        this.saveUserForm = JSON.parse(JSON.stringify(user))
        if (this.saveUserForm.email) {
          const emailFullPath = this.saveUserForm.email
          this.$set(this.saveUserForm, 'emailPrefix', emailFullPath.substring(0, emailFullPath.indexOf('@')))
          this.$set(this.saveUserForm, 'emailSuffix', emailFullPath.substring(emailFullPath.indexOf('@')))
        }
        this.saveUserDialogFormTitle = '修改用户'
        this.saveUserAvatarTitle = '修改'
        this.saveUserDialogFormVisible = true
      } else {
        if (!this.saveUserForm.deptId || this.saveUserForm.deptId === '0') {
          this.$notify({
            message: '请选择所属单位！',
            type: 'error',
            duration: 2000
          })
          return false
        }
        // 创建
        this.saveUserAvatarTitle = '上传'
        this.saveUserDialogFormTitle = '创建用户'
        this.saveUserDialogFormVisible = true
      }
    },
    errorAvatarHandler() {
      return true
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg'

      const isPNG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG && !isPNG) {
        this.$message.error('上传头像图片只能是 JPG或PNG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isPNG && isLt2M
    },
    uploadAvatarSuccess(response) {
      // 返回缓存值，提交保存时将缓存值一并提交。
      if (response.code === 200) {
        this.avatarRedisKey = response.data.avatarRedisKey
        this.saveUserForm.avatar = response.data.avatar
        this.$refs.uploadAvatar.clearFiles()
      } else {
        this.$notify({
          message: response.msg,
          type: 'error',
          duration: 2000
        })
      }
    },
    uploadAvatarError() {
      this.$notify({
        message: '服务器内部错误！',
        type: 'error',
        duration: 2000
      })
      this.$refs.uploadAvatar.clearFiles()
    },
    closeSaveUserDialogFormVisible() {
      this.saveUserDialogFormVisible = false
      this.$refs.saveUserFormRef.clearValidate()
      this.refreshSaveUserForm()
    },
    refreshSaveUserForm() {
      this.saveUserForm.id = undefined
      this.saveUserForm.avatar = undefined
      this.saveUserForm.username = undefined
      this.saveUserForm.password = undefined
      this.saveUserForm.realName = undefined
      this.saveUserForm.phone = undefined
      this.saveUserForm.email = undefined
      this.saveUserForm.emailPrefix = undefined
      this.saveUserForm.emailSuffix = '@icloud.com'
      this.saveUserForm.status = true
    }
  }
}
</script>

<style scoped>
.line {
  text-align: center;
}
</style>
<style>
.el-select .el-input {
  width: 130px;
}
</style>

