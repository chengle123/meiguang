<template>
  <div>
    每隔 <el-input-number v-model="second" controls-position="right" @change="handleChange" :min="150"></el-input-number> 秒，发送一次
    <el-button type="primary" size="small" plain v-if="releaseType" @click="release('start')" :disabled="!wxType">开始发单</el-button>
    <el-button type="danger" size="small" plain v-if="!releaseType" @click="release('end')">停止发单</el-button>
    <div>
      <el-table
        height="450"
        ref="multipleTable"
        :data="selectGoodsList"
        tooltip-effect="dark"
        style="width: 100%">
        <el-table-column
          prop="date"
          label="商品名称"
          width="150"
          show-overflow-tooltip>
          <template slot-scope="scope">{{ scope.row.date }}</template>
        </el-table-column>
        <el-table-column
          prop="name"
          label="商品价格">
        </el-table-column>
        <el-table-column
          prop="abc"
          label="优惠券">
        </el-table-column>
        <el-table-column
          prop="abc"
          label="状态">
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        releaseType:true,
        second: 150,
        selectGoodsList: [{
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
      socket.on('progressRelease', function (data) {
        _this.goodsList = data.data.list;
        if(data.result === "success"){
          this.$notify({
            title: '发送成功',
            message: data.data.accomplish.name+'--发送成功',
            type: 'success'
          });
        }else{
          this.$notify({
            title: '发送失败',
            message: data.data.accomplish.name+'--发送失败',
            type: 'error'
          });
        }
      });
      socket.on('release',function(data){
        _this.$message({
            type: data.result,
            message: data.msg
        });
      });
    },
    methods: {
      release(type){
        var _this = this;
        if(type == 'start'){
          this.releaseType = false;
          socket.emit('startRelease',{
            second: _this.second
          });
        }else{
          this.releaseType = true;
          socket.emit('endRelease','');
        }
      }
    }
  }
</script>
<style>
.el-input-number{
  line-height: 32px;
}
.el-input__inner{
  height: 32px;
  line-height: 32px;
}
.el-input-number.is-controls-right .el-input-number__decrease, .el-input-number.is-controls-right .el-input-number__increase{
  line-height: 15px;
}
.el-input-number.is-controls-right .el-input-number__decrease{
  bottom:2px;
}
</style>
