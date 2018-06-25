<template>
  <div>
    <el-row :gutter="20" style="height:400px;">
      <el-col :span="8">
        <div class="border-box">
          <h3>微信登陆</h3>
          <div class="textCenter">
            <img :src="wxImgUrl" :alt="wxImgUrlText" style="max-width:180px;max-height:180px;">
          </div>
          <div class="textCenter">
            <span>
              {{ wxName }}
            </span>
            <el-button type="text" @click="gitWxLogin" v-show="!wxType">重新加载二维码</el-button>
          </div>
        </div>
        <div class="border-box pb20">
          <h3>设置美逛pid</h3>
          <el-input v-model="PID" placeholder="请输入美逛pid"></el-input>
        </div>
      </el-col>
      <el-col :span="8" >
        <div class="border-box pb20" style="height:340px;">
          <h3>选择发单组</h3>
          <div style="overflow: hidden;height:100%;">
            <div style="overflow:auto;height:340px;">
              <el-checkbox-group v-model="pushAddress">
                <el-checkbox v-for="item in wxContacts" :label="item.NickName" :disabled="pushAddress.length==1 && pushAddress[0] != item.NickName">{{ item.NickName }}</el-checkbox>
              </el-checkbox-group>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="border-box pb20">
          <h3>微信设置</h3>
          <div>
            <el-checkbox v-model="wxPassFriend">自动同意加好友请求</el-checkbox>
          </div>
        </div>
      </el-col>
    </el-row>
    <div style="margin-top:10px;padding-top:10px; text-align:center;border-top:2px solid #e4e7ed;">
      <el-button type="primary" size="small" plain @click="queryWX" :disabled="!wxType">确认微信配置</el-button>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        pushAddress: [],
        wxImgUrl:'',
        wxImgUrlText:'微信二维码',
        wxName:'手机微信扫一扫登陆',
        wxType:false,
        wxContacts:[],
        wxPassFriend:false,
        PID:''
      }
    },
    mounted(){
      var _this = this;
      socket.emit('wxLogin','');
      socket.on('wxLogin', function (data) {
        if(data.result === "success"){
          _this.wxImgUrl = data.data.url;
        }else{
          _this.wxImgUrlText = '请重新加载二维码';
          _this.$message({
              type: 'error',
              message: data.msg+',请重新加载二维码'
          });
        }
      });
      socket.on('user-avatar', function (data) {
        if(data.result === "success"){
          _this.wxImgUrlText = '微信登录成功';
          _this.wxType = true;
          _this.wxName = data.data.userName;
          _this.wxImgUrl = data.data.url;
          _this.wxContacts = data.data.contacts;
        }
        _this.$message({
            type: data.result,
            message: data.msg
        });
      });
      socket.on('queryWX', function (data) {
        _this.$message({
            type: data.result,
            message: data.msg
        });
      });
    },
    methods: {
      gitWxLogin(){
        socket.emit('wxLogin','');
      },
      queryWX(){
        var _this = this;
        if(this.pushAddress.length<=0){
          _this.$message({
              type: 'error',
              message: '请选择发单组'
          });
          return;
        }
        if(!this.PID){
          _this.$message({
              type: 'error',
              message: '请填入美逛PID'
          });
          return;
        }
        var select = {};
        _this.wxContacts.map(item=>{
          if(item.NickName === _this.pushAddress[0]){
            select = item;
          }
        })
        socket.emit('queryWX',{
          mgPid: _this.PID,
          wxPassFriend: _this.wxPassFriend,
          wxContacts: select
        });
      }
    }
  }
</script>