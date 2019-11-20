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
            <el-button type="text" @click="anewGetWxLogin" v-show="!wxType">重新加载二维码</el-button>
          </div>
        </div>
        <div class="border-box pb20">
          <h3>设置美逛pid</h3>
          <el-input v-model="PID" placeholder="请输入美逛pid"></el-input>
        </div>
      </el-col>
      <el-col :span="8" >
        <div class="border-box pb20" style="height:310px;margin-bottom:0">
          <h3>选择发单组</h3>
          <div style="overflow: hidden;height:100%;">
            <div style="overflow:auto;height:310px;">
              <el-checkbox-group v-model="pushAddress">
                <el-checkbox v-for="item in wxContacts" :label="item.NickName" >{{ item.NickName }}</el-checkbox>
                <!-- :disabled="pushAddress.length==1 && pushAddress[0] != item.NickName" -->
              </el-checkbox-group>
            </div>
          </div>
        </div>
        <el-button type="text" @click="refreshFlock" v-show="wxType">刷新群组</el-button>
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
      this.getWxLogin();
      socket.on('userAvatar', function (data) {
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
      socket.on('logout', function (data) {
        if(data.result === "success"){
          _this.wxContacts = [];
          _this.pushAddress = [];
          _this.wxType = false;
          _this.wxName = '手机微信扫一扫登陆';
          _this.wxImgUrl = '';
          _this.$notify({
            title: '用户已退出登录',
            message: '用户已退出登录',
            type: 'error',
            duration: 0
          });
          setTimeout(()=>{
            _this.getWxLogin();
          },100);
        }
      });
      socket.on('configs', function (data) {
        _this.PID = data.mgPid;
        _this.wxPassFriend = data.wxPassFriend;
      });
    },
    methods: {
      getWxLogin(){
        var _this = this;
        this.$http.post('http://localhost:8990/wxLogin').then(function (data) {
            if(data && data.data.result === 'success'){
                _this.wxImgUrl = data.data.data.url;
            }else{
                _this.wxImgUrlText = '请重新加载二维码';
                _this.$message({
                    type: 'error',
                    message: data.data.msg+',请重新加载二维码'
                });
            }
        })
      },
      anewGetWxLogin(){
        var _this = this;
        this.$http.post('http://localhost:8990/anewGetWxLogin').then(function (data) {
            if(data && data.data.result === 'success'){
                _this.wxImgUrl = data.data.data.url;
            }else{
                _this.wxImgUrlText = '请重新加载二维码';
                _this.$message({
                    type: 'error',
                    message: data.data.msg+',请重新加载二维码'
                });
            }
        })
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
        var select = [];
        // _this.wxContacts.map(item=>{
        //   if(item.NickName === _this.pushAddress[0]){
        //     select = item;
        //   }
        // })
        _this.pushAddress.map(name => {
          _this.wxContacts.map(item=>{
            if(item.NickName === name){
              select.push({
                NickName: item.NickName,
                UserName: item.UserName
              });
            }
          })
        });
        // console.log(_this.pushAddress,select,_this.wxContacts)
        var _this = this;
        this.$http.post('http://localhost:8990/queryWX',{
          mgPid: _this.PID,
          wxPassFriend: _this.wxPassFriend,
          wxContacts: select
        }).then(function (data) {
            _this.$message({
                type: data.data.result,
                message: data.data.msg
            });
        })
      },
      refreshFlock(){
        var _this = this;
        this.$http.post('http://localhost:8990/refreshFlock').then(function (data) {
            if(data && data.data && data.data.result === 'success'){
              _this.wxContacts = data.data.data;
            }
            _this.$message({
                type: data.data.result,
                message: data.data.msg
            });
        })
      }
    }
  }
</script>