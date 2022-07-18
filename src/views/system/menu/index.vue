<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="20">
        <!-- 查询 -->
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="菜单名称：">
            <el-input v-model="searchForm.menuName" placeholder="请输入"/>
          </el-form-item>
          <el-form-item>
            <el-button icon="el-icon-search" type="primary" @click="queryTableList">查询</el-button>
            <el-button type="primary" @click="openSaveMenuDialogForm">创建</el-button>
          </el-form-item>
        </el-form>

        <!-- 列表 -->
        <el-table
          :data="tableData"
          :load="loadTableList"
          :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
          border
          lazy
          row-key="id"
          style="width: 100%"
        >
          <el-table-column align="center" fixed label="菜单名称" prop="menuName"/>
          <el-table-column align="center" label="菜单编码" prop="menuCode"/>
          <el-table-column align="center" label="路由地址" prop="path"/>
          <el-table-column align="center" label="组件路径" prop="component"/>
          <el-table-column align="center" label="是否为外链" prop="isFrame"/>
          <el-table-column align="center" label="外链地址" prop="iframeUrl"/>
          <el-table-column align="center" label="菜单类型" prop="menuType"/>
          <el-table-column align="center" label="图标" prop="icon"/>
          <el-table-column align="center" label="是否隐藏" prop="visible"/>
          <el-table-column align="center" label="状态" prop="status" width="80px">
            <template v-slot="scope">
              <el-switch
                v-model="scope.row.status"
                active-color="#13ce66"
                inactive-color="#ff4949"
              />
            </template>
          </el-table-column>
          <el-table-column align="center" fixed="right" label="操作" width="150">
            <template v-slot="scope">
              <el-button circle class="el-icon-edit" size="mini" type="primary"
                         @click="openSaveMenuDialogForm(scope.row)"
              />
              <el-button circle class="el-icon-delete" size="mini" type="danger" @click="delMenu(scope.row)"/>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <!-- 创建/修改用户 -->
    <el-dialog
      :close-on-click-modal="false"
      :destroy-on-close="true"
      :title="saveMenuDialogFormTitle"
      :visible.sync="saveMenuDialogFormVisible"
      center
      width="30%"
      @close="closeSaveMenuDialogFormVisible"
    >
      <el-form ref="saveMenuFormRef" :model="saveMenuForm" status-icon>
        <el-form-item label="上级菜单" label-width="120px" prop="parentName">
          <el-input v-model="saveMenuForm.parentName" style="width: 80%"/>
        </el-form-item>
        <el-form-item label="菜单名称" label-width="120px" prop="menuName">
          <el-input v-model="saveMenuForm.menuName" style="width: 80%"/>
        </el-form-item>
        <el-form-item label="菜单编码" label-width="120px" prop="menuCode">
          <el-input v-model="saveMenuForm.menuCode" style="width: 80%"/>
        </el-form-item>
        <el-form-item label="路由地址" label-width="120px" prop="path">
          <el-input v-model="saveMenuForm.path" style="width: 80%"/>
        </el-form-item>
        <el-form-item label="组件路径" label-width="120px" prop="component">
          <el-input v-model="saveMenuForm.component" style="width: 80%"/>
        </el-form-item>
        <el-form-item label="是否为外链" label-width="120px" prop="isFrame">
          <el-input v-model="saveMenuForm.isFrame" style="width: 80%"/>
        </el-form-item>
        <el-form-item v-show="this.saveMenuForm.isFrame" label="外链地址" label-width="120px" prop="iframeUrl">
          <el-input v-model="saveMenuForm.iframeUrl" style="width: 80%"/>
        </el-form-item>
        <el-form-item label="菜单类型" label-width="120px" prop="menuType">
          <el-input v-model="saveMenuForm.menuType" style="width: 80%"/>
        </el-form-item>
        <el-form-item label="图标" label-width="120px" prop="icon">
          <el-input v-model="saveMenuForm.icon" style="width: 80%"/>
        </el-form-item>
        <el-form-item label="是否隐藏" label-width="120px" prop="visible">
          <el-input v-model="saveMenuForm.visible" style="width: 80%"/>
        </el-form-item>
        <el-form-item label="状态" label-width="120px">
          <el-switch
            v-model="saveMenuForm.status"
            active-color="#13ce66"
            inactive-color="#ff4949"
            style="width: 200px"
          />
        </el-form-item>
        <el-divider/>
        <el-form-item style="text-align: center; margin-top: 30px">
          <el-button style="margin-right: 30px" @click="closeSaveMenuDialogFormVisible">取消</el-button>
          <el-button type="primary" @click="saveMenu">保存</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { deleteMenu, queryMenuList, saveMenu } from '@/api/system/menu'

export default {
  name: 'Menu',
  data() {
    return {
      searchForm: {
        menuName: undefined
      },
      tableData: [],
      saveMenuDialogFormTitle: '创建菜单',
      saveMenuDialogFormVisible: false,
      saveMenuForm: {
        id: undefined,
        menuName: undefined,
        menuCode: undefined,
        parentId: undefined,
        parentName: undefined,
        orderNum: undefined,
        path: undefined,
        component: undefined,
        isFrame: undefined,
        iframeUrl: undefined,
        menuType: undefined,
        visible: false,
        status: true,
        icon: undefined
      }
    }
  },
  created() {
    this.queryTableList()
  },
  methods: {
    queryTableList() {
      queryMenuList(this.searchForm).then(res => {
        this.tableData = res.data.records
      })
    },
    loadTableList(tree, treeNode, resolve) {
      setTimeout(() => {
        resolve([
          {
            id: 31,
            date: '2016-05-01',
            name: '王小虎',
            address: '上海市普陀区金沙江路 1519 弄'
          }, {
            id: 32,
            date: '2016-05-01',
            name: '王小虎',
            address: '上海市普陀区金沙江路 1519 弄'
          }
        ])
      }, 1000)
    },
    saveMenu() {
      // 创建/修改菜单
      saveMenu(this.saveMenuForm).then(res => {
        if (res.code === 200) {
          this.$message({
            message: this.saveMenuDialogFormTitle + '成功!',
            type: 'success'
          })
        }
        this.saveMenuDialogFormVisible = false
        this.queryTableList()
      }).catch(() => {
        this.$message({
          message: '服务器内部错误！',
          type: 'error'
        })
      }).finally(
        this.$refs.saveMenuFormRef.clearValidate()
      )
    },
    delMenu(menu) {
      const id = menu.id
      deleteMenu(id).then(res => {
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
        this.queryTableList()
      )
    },
    openSaveMenuDialogForm(menu) {
      if (menu && menu.id) {
        // 修改
        this.saveMenuForm = JSON.parse(JSON.stringify(menu))
        this.saveMenuDialogFormTitle = '修改菜单'
        this.saveMenuDialogFormVisible = true
      } else {
        // 创建
        this.saveMenuDialogFormTitle = '创建菜单'
        this.saveMenuDialogFormVisible = true
      }
    },
    closeSaveMenuDialogFormVisible() {
      this.saveMenuDialogFormVisible = false
      this.$refs.saveMenuFormRef.clearValidate()
      this.refreshSaveMenuForm()
    },
    refreshSaveMenuForm() {
      this.saveMenuForm.id = undefined
      this.saveMenuForm.menuName = undefined
      this.saveMenuForm.menuCode = undefined
      this.saveMenuForm.parentId = undefined
      this.saveMenuForm.parentName = undefined
      this.saveMenuForm.orderNum = undefined
      this.saveMenuForm.path = undefined
      this.saveMenuForm.component = undefined
      this.saveMenuForm.isFrame = undefined
      this.saveMenuForm.iframeUrl = undefined
      this.saveMenuForm.menuType = undefined
      this.saveMenuForm.visible = false
      this.saveMenuForm.status = true
      this.saveMenuForm.icon = undefined
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

