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
          width="150"
          sortable
          show-overflow-tooltip>
        </el-table-column>
        <el-table-column
          prop="ShowPrice"
          label="商品价格"
          sortable>
          <template slot-scope="scope">{{ scope.row.ShowPrice * 100 / 10000 }}元</template>
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