<template>
  <div>
    <el-button type="primary" size="small" plain @click="search">搜索</el-button>
    <el-button type="primary" size="small" plain @click="selectGoods">确认商品</el-button>
    <div>
      <el-table
        height="450"
        ref="multipleTable"
        :data="goodsList"
        tooltip-effect="dark"
        style="width: 100%"
        v-loading="loading"
        @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column
          prop="ShowTitle"
          label="商品名称"
          >
          <template slot-scope="scope">
            <a :href="'https://item.taobao.com/item.htm?id='+scope.row.ItemId" target="_blank" v-if="scope.row.IsTmall == 0">{{ scope.row.ShowTitle }}</a>
            <a :href="'https://detail.tmall.com/item.htm?id='+scope.row.ItemId" target="_blank" v-if="scope.row.IsTmall == 1">{{ scope.row.ShowTitle }}</a>
          </template>
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
          sortable>
          <template slot-scope="scope">{{ scope.row.AfterDiscount }}元</template>
        </el-table-column>
        <el-table-column
          prop="SealCount"
          label="商品销量">
        </el-table-column>
        <el-table-column
          prop="QuanAmount"
          label="优惠券"
          sortable>
          <template slot-scope="scope">{{ scope.row.QuanAmount * 100 / 10000 }}元</template>
        </el-table-column>
        <el-table-column
          prop="IsTmall"
          label="来源"
          :filters="[{ text: '淘宝', value: '0' }, { text: '天猫', value: '1' }]"
          :filter-method="filterTag">
          <template slot-scope="scope">
            <img src="../images/taobao.png" class="taobao" v-if="scope.row.IsTmall == 0">
            <img src="../images/tianmao.jpg" class="tianmao" v-if="scope.row.IsTmall == 1">
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
        goodsList: [],
        multipleSelection: [],
        loading: false
      }
    },
    mounted(){
      var _this = this;
      socket.on('getGoodsList', function (data) {
        if(data.result === "success"){
          _this.goodsList = data.data;
          _this.loading = false;
        }
      });
    },
    methods: {
      filterTag(value, row) {
        return row.IsTmall == value;
      },
      handleSelectionChange(val) {
        this.multipleSelection = val
      },
      selectGoods(){
        var _this = this;
        socket.emit('setChosenList',{
          chosenList: _this.multipleSelection
        });
      },
      search(){
        socket.emit('getGoodsList','');
        this.loading = true;
      }
    }
  }
</script>
<style>
.taobao,
.tianmao{
  width:30px;
  height:30px;
  border-radius: 5px;
}
a {
  text-decoration:none;
  color:#409EFF;
}
</style>
