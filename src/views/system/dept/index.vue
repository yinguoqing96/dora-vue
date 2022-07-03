<template>
  <div class="app-container">
    <!-- 组织机构树 -->
    <el-row :gutter="20">
      <el-col :span=4>
        <el-input
          placeholder="输入关键字进行过滤"
          v-model="deptTreeFilterText"
        >
        </el-input>

        <el-tree
          class="filter-tree"
          :data="deptTree"
          node-key="id"
          :props="{
            children: 'children',
            label: 'deptName'
          }"
          :filter-node-method="deptTreeFilterNode"
          highlight-current
          ref="deptTreeRef"
          @node-click="deptTreeClick"
        >
        </el-tree>
      </el-col>
      <el-col :span=20>
        <!-- 查询 -->
        <el-form :inline="true" :model="searchForm" class="demo-form-inline">
          <el-form-item label="部门名称：">
            <el-input v-model="searchForm.deptName" placeholder="请输入"/>
          </el-form-item>
          <el-form-item label="部门代码：">
            <el-input v-model="searchForm.deptCode" placeholder="请输入"/>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="search">查询</el-button>
            <el-button type="primary" @click="openSaveDeptDialogForm">创建</el-button>
          </el-form-item>
        </el-form>

        <!-- 列表 -->
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column fixed prop="deptName" label="部门名称"/>
          <el-table-column prop="deptCode" label="部门代码"/>
          <el-table-column prop="leaderName" label="部门负责人"/>
          <el-table-column prop="level" label="部门等级"/>
          <el-table-column prop="extend.introduction" label="部门简介"/>
          <el-table-column prop="status" label="状态">
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
              <el-button type="primary" class="el-icon-edit" circle @click="openSaveDeptDialogForm(scope.row)"/>
              <el-button type="danger" class="el-icon-delete" circle @click="delDept(scope.row)"/>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页插件 -->
        <el-pagination
          v-show="tableDataTotal > 1"
          @size-change="handlePaginationSizeChange"
          @current-change="handlePaginationCurrentChange"
          :current-page="searchForm.pageNumber"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="10"
          layout="total, sizes, prev, pager, next, jumper"
          :total="tableDataTotal"
        >
        </el-pagination>
      </el-col>
    </el-row>

    <!-- 创建/修改部门 -->
    <el-dialog
      :title="saveDeptDialogFormTitle"
      :visible.sync="saveDeptDialogFormVisible"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      width="30%"
      center
    >
      <el-form :model="saveDeptForm">
        <el-form-item label="上级部门" label-width="120px">
          <el-input v-model="saveDeptForm.parentName" disabled style="width: 80%"/>
        </el-form-item>
        <el-form-item label="部门名称" label-width="120px">
          <el-input v-model="saveDeptForm.deptName" style="width: 80%"/>
        </el-form-item>
        <el-form-item label="部门代码" label-width="120px">
          <el-input v-model="saveDeptForm.deptCode" style="width: 80%"/>
        </el-form-item>
        <el-form-item label="部门负责人" label-width="120px">
          <el-input v-model="saveDeptForm.leader" style="width: 80%"/>
        </el-form-item>
        <el-form-item label="部门等级" label-width="120px">
          <el-input v-model="saveDeptForm.level" style="width: 80%"/>
        </el-form-item>
        <el-form-item label="状态" label-width="120px">
          <el-switch
            v-model="saveDeptForm.status"
            active-color="#13ce66"
            inactive-color="#ff4949"
            style="width: 200px"
          />
        </el-form-item>
        <el-divider/>
        <el-form-item style="text-align: center; margin-top: 30px">
          <el-button style="margin-right: 30px" @click="saveDeptDialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="saveDept">保存</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 分页 -->
  </div>
</template>

<script>
import { saveDept, queryDeptList, getDeptTree } from '@/api/system/dept'

export default {
  name: 'Dept',
  data() {
    return {
      searchForm: {
        id: undefined,
        deptName: undefined,
        deptCode: undefined,
        pageNumber: 1,
        pageSize: 10
      },
      tableData: [],
      tableDataTotal: 0,
      deptTree: [],
      deptTreeFilterText: '',
      saveDeptDialogFormTitle: '创建用户',
      saveDeptDialogFormVisible: false,
      saveDeptForm: {
        id: undefined,
        deptName: undefined,
        deptCode: undefined,
        parentId: undefined,
        parentName: undefined,
        leader: undefined,
        level: undefined,
        status: true
      }
    }
  },
  created() {
    this.queryTableList()
    this.getDeptTree()
  },
  watch: {
    deptTreeFilterText(val) {
      this.$refs.deptTreeRef.filter(val)
    }
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
      this.saveDeptForm.parentId = data.id
      this.saveDeptForm.parentName = data.deptName
      this.searchForm.id = data.id
      this.search()
    },
    search() {
      this.searchForm.pageNumber = 1
      this.queryTableList()
    },
    handlePaginationSizeChange(val) {
      this.searchForm.pageSize = val
    },
    handlePaginationCurrentChange(val) {
      this.searchForm.pageNumber = val
    },
    queryTableList() {
      queryDeptList(this.searchForm).then(res => {
        this.tableData = res.data.records
        this.tableDataTotal = res.data.total
      })
    },
    saveDept() {
      // 创建/修改部门
      saveDept(this.saveDeptForm).then(res => {
        if (res.code === 200) {
          this.$message({
            message: this.saveDeptDialogFormTitle + '成功!',
            type: 'success'
          })
        }
        this.saveDeptDialogFormVisible = false
        this.search()
        this.getDeptTree()
      })
    },
    delDept(dept) {
      this.$message({
        message: 'delDept!',
        type: 'warning'
      })
    },
    openSaveDeptDialogForm(dept) {
      if (!this.saveDeptForm.parentId) {
        this.saveDeptForm.parentId = 0
        this.saveDeptForm.parentName = '全部'
      }
      if (dept && dept.id) {
        // 修改
        this.$set(this, 'saveDeptForm', dept)
        this.saveDeptDialogFormTitle = '修改用户'
        this.saveDeptDialogFormVisible = true
      } else {
        // 创建
        this.saveDeptDialogFormTitle = '创建用户'
        this.saveDeptDialogFormVisible = true
      }
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

