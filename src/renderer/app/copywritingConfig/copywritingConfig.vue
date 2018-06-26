<template>
  <div>
    <el-row :gutter="20" style="height:330px;">
      <el-col :span="8">
        <div class="border-box pb20">
          <h3>回复模板</h3>
          <el-input
            type="textarea"
            :autosize="{ minRows: 11, maxRows: 11}"
            placeholder="请输入内容"
            v-model="textTemplate">
          </el-input>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="border-box pb20">
          <h3>模板设置</h3>
          <div>
            <el-checkbox style="margin-bottom:10px;" v-model="sendImg">是否发送图片</el-checkbox>
            <el-input v-model="invitationCode" placeholder="美逛邀请码，可不填"></el-input>
          </div>
        </div>
      </el-col>
    </el-row>
    <div class="border-box pb20">
      <h3>可用变量</h3>
      <div>
        {商品名称}，{商品价格}，{券价格}，{券后价格}，{淘口令}，{商品文案}，{短连接}
      </div>
    </div>
    <div style="margin-top:10px;padding-top:10px; text-align:center;border-top:2px solid #e4e7ed;">
      <el-button type="primary" size="small" plain @click="queryText">确认文案配置</el-button>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        sendImg:false,
        invitationCode:'',
        textTemplate:
`【商品名称】{商品名称}
【原价】{商品价格}元
【优惠券】{券价格}元
【券后价】{券后价格}元
【领券口令】{淘口令}
【推荐理由】{商品文案}
复制这条消息，打开 “手机淘宝” 即可领券`,
      }
    },
    mounted(){
      var _this = this;
      socket.on('queryText', function (data) {
        _this.$message({
            type: data.result,
            message: data.msg
        });
      });
    },
    methods: {
      queryText(){
        var _this = this;
        socket.emit('queryText',{
          textTemplate: _this.textTemplate,
          sendImg: _this.sendImg,
          invitationCode: _this.invitationCode || 'ZCMVPZR'
        });
      }
    }
  }
</script>