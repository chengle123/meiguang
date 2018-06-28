<template>
  <div>
    每隔 <el-input-number v-model="second" controls-position="right" :min="150"></el-input-number> 秒，发送一次
    <el-button type="primary" size="small" plain v-if="releaseType" @click="release('start')" :disabled="!wxSet && chosenList.length == 0">开始发单</el-button>
    <el-button type="danger" size="small" plain v-if="!releaseType" @click="release('end')">停止发单</el-button>
    <div>
      <el-table
        height="450"
        ref="multipleTable"
        :data="chosenList"
        tooltip-effect="dark"
        style="width: 100%">
        <el-table-column
          prop="ShowTitle"
          label="商品名称"
          show-overflow-tooltip
          width="150">
        </el-table-column>
        <el-table-column
          prop="TgPic"
          label="图片">
          <template slot-scope="scope">
            <img :src="scope.row.TgPic" style="width:60px;height:60px;">
          </template>
        </el-table-column>
        <el-table-column
          prop="AfterDiscount"
          label="券后价"
          >
          <template slot-scope="scope">{{ scope.row.AfterDiscount }}元</template>
        </el-table-column>
        <el-table-column
          prop="QuanAmount"
          label="优惠券">
          <template slot-scope="scope">{{ scope.row.QuanAmount * 100 / 10000 }}元</template>
        </el-table-column>
        <el-table-column
          prop="IsTmall"
          label="来源">
          <template slot-scope="scope">
            <img src="../images/taobao.png" class="taobao" v-if="scope.row.IsTmall == 0">
            <img src="../images/tianmao.jpg" class="tianmao" v-if="scope.row.IsTmall == 1">
          </template>
        </el-table-column>
        <el-table-column
          prop="GoodsType"
          label="状态">
          <template slot-scope="scope">
            <span v-if="!scope.row.GoodsType">等待发送</span>
            <span style="color:#F56C6C;" v-if="scope.row.GoodsType && scope.row.GoodsType == '失败'">失败</span>
            <span style="color:#67C23A;" v-if="scope.row.GoodsType && scope.row.GoodsType == '成功'">成功</span>
          </template>
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
        chosenList: [],
        wxSet:false
      }
    },
    mounted(){
      var _this = this;
      socket.on('progressRelease', function (data) {
        _this.chosenList = data.data.chosenList;
        if(data.result === "success"){
          _this.$notify({
            title: '发送成功',
            message: data.data.accomplish.name+'--发送成功',
            type: 'success'
          });
        }else{
          _this.$notify({
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
      socket.on('setChosenList',function(data){
        if(data.result == 'success'){
          _this.chosenList = data.data
        }else{
          _this.$message({
              type: data.result,
              message: data.msg
          });
        }
      });
      socket.on('queryWX', function (data) {
        if(data.result == 'success'){
          _this.wxSet = true;
        }
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
