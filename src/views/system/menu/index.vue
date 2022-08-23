<template>
  <div class="app-container">
    <!-- 查询 -->
    <el-form :inline="true" :model="searchForm" class="demo-form-inline">
      <el-form-item label="菜单名称：">
        <el-input v-model="searchForm.menuName" clearable placeholder="请输入" />
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" type="primary" @click="queryTableList">查询</el-button>
        <el-button type="primary" @click="openCreate">创建</el-button>
      </el-form-item>
    </el-form>

    <!-- 列表 -->
    <el-table
      ref="tableMixin"
      :data="tableData"
      row-key="id"
      :tree-props="{children: 'children'}"
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="菜单名称" prop="menuName" />
      <el-table-column label="菜单地址" prop="path" />
      <el-table-column label="组件路径" prop="component" />
      <el-table-column label="菜单类型" prop="menuType">
        <template v-slot="scope">
          <template v-if="scope.row.menuType === '0'">模块</template>
          <template v-if="scope.row.menuType === '1'">目录</template>
          <template v-if="scope.row.menuType === '2'">菜单</template>
        </template>
      </el-table-column>
      <el-table-column label="菜单ICON" prop="icon">
        <template v-slot="scope">
          <i :class="['dora-icon', scope.row.icon]" />
        </template>
      </el-table-column>
      <el-table-column label="是否启用" prop="status">
        <template v-slot="scope">
          <el-tag
            :type="scope.row.status ? 'success' : 'danger'"
          >{{ scope.row.status ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="sort" />
      <el-table-column label="操作" align="center" fixed="right" class-name="small-padding fixed-width btn_color">
        <template v-slot="scope">
          <el-button :disabled="scope.row.menuType==='2'" type="primary" size="mini" title="添加子菜单" icon="el-icon-document-add" @click="openCreate(scope.row.menuType, scope.row.id)" />
          <el-divider direction="vertical" />
          <el-button type="primary" size="mini" icon="el-icon-edit" title="编辑" @click="openUpdate(scope.row)" />
          <el-divider direction="vertical" />
          <el-popconfirm
            title="确定要删除这条记录吗？"
            @confirm="handleDelOne(scope.row.id)"
          >
            <el-button slot="reference" type="danger" size="mini" title="删除" icon="el-icon-delete" circle />
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      :close-on-click-modal="false"
      :title="textMap[saveMenuDialogStatus]"
      :visible.sync="saveMenuDialogFormVisible"
      width="500px"
    >
      <el-form
        ref="saveMenuFormRef"
        :model="saveMenuForm"
        label-position="left"
        label-width="80px"
        style="width: 400px; margin-left:30px;"
      >
        <el-input v-model="saveMenuForm.parentId" style="display:none;" />
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="saveMenuForm.menuName" />
        </el-form-item>
        <el-form-item label="菜单地址" prop="path">
          <el-input v-model="saveMenuForm.path" />
        </el-form-item>
        <el-form-item label="组件路径" prop="component">
          <el-input v-model="saveMenuForm.component" />
        </el-form-item>
        <el-form-item label="菜单图标" prop="icon">
          <el-select v-model="saveMenuForm.icon" popper-class="icon-select" placeholder="请选择" style="width: 100%">
            <el-option
              v-for="item in iconList.glyphs"
              :key="item.icon_id"
              :label="iconList.css_prefix_text+item.font_class"
              :value="iconList.css_prefix_text+item.font_class"
            >
              <div>
                <i :class="[iconList.font_family, iconList.css_prefix_text+item.font_class]" />
                <span>{{ item.font_class }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="orderNum">
          <el-input v-model="saveMenuForm.orderNum" />
        </el-form-item>
        <el-form-item label="菜单类型" prop="menuType">
          <el-radio-group v-model="saveMenuForm.menuType">
            <el-radio-button label="0">模块</el-radio-button>
            <el-radio-button label="1">目录</el-radio-button>
            <el-radio-button label="2">菜单</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否启用" prop="status">
          <el-radio-group v-model="saveMenuForm.status">
            <el-radio-button label="true">启用</el-radio-button>
            <el-radio-button label="false">禁用</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="saveMenuDialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="saveMenu()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deleteMenu, queryMenuList, saveMenu } from '@/api/system/menu'
import fontIcons from '@/assets/fonts/iconfont.json'

export default {
  name: 'Menu',
  data() {
    return {
      searchForm: {
        id: 0,
        menuName: undefined
      },
      textMap: {
        update: '修改',
        create: '创建'
      },
      saveMenuDialogStatus: 'create',
      iconList: fontIcons,
      tableData: [],
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
        menuType: 1,
        status: true,
        icon: undefined
      },
      menuTypeList: [
        {
          id: '1',
          name: '目录'
        }, {
          id: '2',
          name: '菜单'
        }
      ]
    }
  },
  created() {
    this.queryTableList()
  },
  methods: {
    queryTableList() {
      if (this.searchForm.menuName) {
        this.searchForm.id = undefined
      }
      queryMenuList(this.searchForm).then(res => {
        this.tableData = res.data
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
    // 打开创建模态框
    openCreate(type, id) {
      this.resetForm()
      delete this.saveMenuForm.id
      // type:  0系统，1目录，2菜单和按钮
      this.saveMenuForm.menuType = (Number(type) + 1).toString()
      if (id === undefined || id === null) {
        this.saveMenuForm.parentId = '0'
      } else {
        this.saveMenuForm.parentId = id
      }
      this.saveMenuDialogStatus = 'create'
      this.saveMenuDialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['saveMenuFormRef'].clearValidate()
      })
    },
    // 打开修改模态框
    openUpdate(row) {
      this.resetForm()
      this.saveMenuForm = Object.assign({}, row)
      this.saveMenuDialogStatus = 'update'
      this.saveMenuDialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['saveMenuFormRef'].clearValidate()
      })
    },
    saveMenu() {
      // 创建/修改菜单
      saveMenu(this.saveMenuForm).then(res => {
        if (res.code === 200) {
          this.$message({
            message: this.textMap[this.saveMenuDialogStatus] + '成功!',
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
    // 清空表单
    resetForm() {
      this.saveMenuForm = {
        id: undefined,
        menuName: undefined,
        menuCode: undefined,
        parentId: undefined,
        parentName: undefined,
        orderNum: undefined,
        path: undefined,
        component: undefined,
        menuType: 1,
        status: true,
        icon: undefined
      }
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
        this.saveMenuDialogStatus = 'update'
        this.saveMenuDialogFormVisible = true
      } else {
        // 创建
        this.saveMenuDialogStatus = 'create'
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

