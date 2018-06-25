<template>
  <div>
    <el-button type="primary" size="small" plain @click="selectGoods">确认商品</el-button>
    <div>
      <el-table
        height="450"
        ref="multipleTable"
        :data="goodsList"
        tooltip-effect="dark"
        style="width: 100%"
        @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column
          prop="date"
          label="商品名称"
          width="150"
          sortable
          show-overflow-tooltip>
          <template slot-scope="scope">{{ scope.row.date }}</template>
        </el-table-column>
        <el-table-column
          prop="name"
          label="商品价格"
          sortable>
        </el-table-column>
        <el-table-column
          prop="address"
          label="商品销量">
        </el-table-column>
        <el-table-column
          prop="abc"
          label="优惠券"
          sortable>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        goodsList: [{
          date: '2016-05-03',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄',
          abc: '30'
        }, {
          date: '2016-05-02',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄',
          abc: '25'
        }, {
          date: '2016-05-04',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄',
          abc: '10'
        }, {
          date: '2016-05-01',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄',
          abc: '20'
        }, {
          date: '2016-05-08',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄',
          abc: '5'
        }, {
          date: '2016-05-06',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄',
          abc: '20'
        }, {
          date: '2016-05-07',
          name: '王小虎',
          address: '上海市普陀区金沙江路 1518 弄',
          abc: '10'
        }],
        multipleSelection: []
      }
    },
    mounted(){
      var _this = this;
      socket.on('getGoods', function (data) {
        if(data.result === "success"){
          _this.goodsList = data.data;
        }
      });
    },
    methods: {
      handleSelectionChange(val) {
        console.log(val)
        this.multipleSelection = val;
        
      },
      selectGoods(){

      }
    }
  }
</script>