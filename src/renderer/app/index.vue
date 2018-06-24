<template>
    <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
        <el-tab-pane label="微信配置" name="weixin">
            <weixin-config></weixin-config>
        </el-tab-pane>
        <el-tab-pane label="文案配置" name="wenan">
            <copywriting-config></copywriting-config>
        </el-tab-pane>
        <el-tab-pane label="产品库" name="chanpin">
            <goods-lib></goods-lib>
        </el-tab-pane>
        <el-tab-pane label="定时发单" name="dingshi">
            <timing-send></timing-send>
        </el-tab-pane>
    </el-tabs>
</template>

<script>
import $ from 'jquery'
import weixinConfig from './weixinConfig/weixinConfig'
import copywritingConfig from './copywritingConfig/copywritingConfig'
import goodsLib from './goodsLib/goodsLib'
import timingSend from './timingSend/timingSend'

export default {
    data(){
        return {
            activeName: 'weixin'
        }
    },
    components: { weixinConfig, copywritingConfig, goodsLib, timingSend },
    methods: {
        handleClick(tab, event){

        }
    }
}
</script>
