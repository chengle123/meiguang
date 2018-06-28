<template>
  <div class="login">
    <div class="loginFrame">
        <div>
            <el-row>
                <el-col :span="5" class="lineheight40">
                    邮箱：
                </el-col>
                <el-col :span="19">
                    <el-input v-model="email" placeholder="邮箱"></el-input>
                </el-col>
            </el-row>
            <el-row style="margin-bottom:0;">
                <el-col :span="5" class="lineheight40">
                    密码：
                </el-col>
                <el-col :span="19">
                    <el-input v-model="password" placeholder="密码" type="password"></el-input>
                </el-col>
            </el-row>
        </div>
        <div class="text-right">
            <el-button type="text" @click="dialogVisible = true">注册</el-button>
        </div>
        <div class="text-center">
            <el-button type="primary" style="width:50%;margin-left:20px;" @click="login()">登录</el-button>
        </div>
    </div>
    <el-dialog
    title="注册账号"
    :visible.sync="dialogVisible"
    width="400px"
    @open="openDialog">
    <div>
        <el-row>
            <el-col :span="5" class="lineheight40">
                邮箱：
            </el-col>
            <el-col :span="19">
                <el-input v-model="zcEmail" placeholder="邮箱"></el-input>
            </el-col>
        </el-row>
        <el-row style="margin-top:10px;">
            <el-col :span="5" class="lineheight40">
                密码：
            </el-col>
            <el-col :span="19">
                <el-input v-model="zcPassword" placeholder="密码" type="password"></el-input>
            </el-col>
        </el-row>
        <el-row style="margin-top:10px;">
            <el-col :span="5" class="lineheight40">
                确认密码：
            </el-col>
            <el-col :span="19">
                <el-input v-model="zcQueryPassword" placeholder="确认密码" type="password"></el-input>
            </el-col>
        </el-row>
    </div>
    <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="zcQuery()">确 定</el-button>
    </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data () {
      return {
          dialogVisible:false,
          password:'',
          email:'',
          zcEmail:'',
          zcPassword: '',
          zcQueryPassword:'',
          equipmentId:''
      }
    },
    mounted(){
      var _this = this;
      socket.on('equipmentId', function (data) {
        if(data.result === "success"){
          _this.equipmentId = data.data.equipmentId;
        }
      });
      setTimeout(()=>{
            socket.emit('equipmentId','');
      },100)
    },
    methods: {
        login(){
            var _this = this;
            var filter  = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            if(!filter.test(this.email)){
                _this.$message({
                    type: 'error',
                    message: '邮箱格式错误'
                });
                return;
            }
            if(!this.password){
                _this.$message({
                    type: 'error',
                    message: '请填写密码'
                });
                return;
            }
            this.$http.post('http://meiguang.emym.top/login', {
                name: _this.email,
                password: _this.password,
                equipmentId: _this.equipmentId
            }).then(function(data){
                if(data && data.data.result === 'success'){
                    _this.$router.push({name: 'index'});
                }
                _this.$message({
                    type: data.data.result,
                    message: data.data.msg
                });
            });
        },
        openDialog(){
          this.zcEmail = '';
          this.zcPassword = '';
          this.zcQueryPassword = '';
        },
        zcQuery(){
            var _this = this;
            var filter  = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
            if(!filter.test(this.zcEmail)){
                _this.$message({
                    type: 'error',
                    message: '邮箱格式错误'
                });
                return;
            }
            if(!this.zcPassword){
                _this.$message({
                    type: 'error',
                    message: '请填写密码'
                });
                return;
            }
            if(this.zcPassword.length < 6){
                _this.$message({
                    type: 'error',
                    message: '密码最少为6位数字或字母'
                });
                return;
            }
            if(!this.zcQueryPassword){
                _this.$message({
                    type: 'error',
                    message: '请确认密码'
                });
                return;
            }
            if(this.zcPassword != this.zcQueryPassword){
                _this.$message({
                    type: 'error',
                    message: '两次密码不一样'
                });
                return;
            }
            this.$http.post('http://meiguang.emym.top/signin', {
                name: _this.zcEmail,
                password: _this.zcPassword,
                equipmentId: _this.equipmentId
            }).then(function(data){
                if(data && data.data.result === 'success'){
                    _this.dialogVisible = false;
                }
                _this.$message({
                    type: data.data.result,
                    message: data.data.msg
                });
            });
        }
    }
  }
</script>
<style>
#app{
    height:100%;
}
.login{
    position: relative;
    height:100%;
}
.loginFrame{
    width:300px;
    padding:30px;
    position: absolute;
    top:50%;
    left:50%;
    margin-left:-181px;
    margin-top:-116px;
    border:1px solid #66b1ff;
    border-radius: 5px;
}
.loginFrame .el-row{
    margin-bottom:10px;
}
.lineheight40{
    line-height: 40px;
}
.text-right{
    text-align: right;
}
.text-center{
    text-align: center;
}
</style>
