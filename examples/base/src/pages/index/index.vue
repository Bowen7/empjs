<template>
  <view>
    <counter></counter>
    <button class="btn" bindtap="handleTap">go to log</button>
    <origin-com></origin-com>
  </view>
</template>
<script>
import counter from '../../components/counter/counter.vue'
import originCom from '../../components/origin-com/origin-com.wxml'
export default {
  components: { counter, 'origin-com': originCom },
  configs: {
    navigationBarTitleText: 'index'
  },
  methods: {
    onLoad() {
      console.log('pages/index/index is loaded')
    },
    handleTap() {
      wx.navigateTo({
        url: '/pages/logs/logs'
      })
    }
  }
}
</script>
<style>
@import './style.css';
.btn {
  margin-top: 100px;
}
</style>
