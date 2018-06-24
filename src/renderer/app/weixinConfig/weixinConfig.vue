<template>
  <div>
    <el-row :gutter="20" style="height:400px;">
      <el-col :span="8">
        <div class="border-box">
          <h3>微信登陆</h3>
          <div class="textCenter">
            <img src="" alt="二维码" style="width:180px;height:180px;">
          </div>
          <div class="textCenter">
            <span>
              手机微信扫一扫登陆
            </span>
            <el-button type="text">重新加载二维码</el-button>
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
                <el-checkbox label="xxxxxxx">xxxxxxxx</el-checkbox>
                <el-checkbox label="aaaa">aaaa</el-checkbox>
                <el-checkbox label="清清浅浅">清清浅浅</el-checkbox>
                <el-checkbox label="点点滴滴">点点滴滴</el-checkbox>
                <el-checkbox label="一个广告">一个广告</el-checkbox>
                <el-checkbox label="xxxxxxx">xxxxxxxx</el-checkbox>
                <el-checkbox label="aaaa">aaaa</el-checkbox>
                <el-checkbox label="清清浅浅">清清浅浅</el-checkbox>
                <el-checkbox label="点点滴滴">点点滴滴</el-checkbox>
                <el-checkbox label="一个广告">一个广告</el-checkbox>
                <el-checkbox label="xxxxxxx">xxxxxxxx</el-checkbox>
                <el-checkbox label="aaaa">aaaa</el-checkbox>
                <el-checkbox label="清清浅浅">清清浅浅</el-checkbox>
                <el-checkbox label="点点滴滴">点点滴滴</el-checkbox>
                <el-checkbox label="一个广告">一个广告</el-checkbox>
                <el-checkbox label="xxxxxxx">xxxxxxxx</el-checkbox>
                <el-checkbox label="aaaa">aaaa</el-checkbox>
                <el-checkbox label="清清浅浅">清清浅浅</el-checkbox>
                <el-checkbox label="点点滴滴">点点滴滴</el-checkbox>
                <el-checkbox label="一个广告">一个广告</el-checkbox>
              </el-checkbox-group>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="border-box pb20">
          <h3>微信设置</h3>
          <div>
            <el-checkbox v-model="approvalFriends">自动同意加好友请求</el-checkbox>
          </div>
        </div>
      </el-col>
    </el-row>
    <div style="margin-top:10px;padding-top:10px; text-align:center;border-top:2px solid #e4e7ed;">
      <el-button type="primary" size="small" plain>确认微信配置</el-button>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        pushAddress: []
      }
    }
  }
</script>