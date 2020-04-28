<template>
  <view>
    <counter></counter>
    <button class="btn" bindtap="handleTap">go to log</button>
  </view>
</template>
<script>
import counter from '../../components/counter/counter.vue'
export default {
  _components: { counter },
  _configs: {
    navigationBarTitleText: 'index'
  },
  onLoad() {
    console.log('pages/index/index is loaded')
  },
  handleTap() {
    wx.navigateTo({
      url: '/pages/logs/logs'
    })
  }
}
</script>
<style lang="css">
@import './style.css';
.btn {
  margin-top: 100px;
}
</style>
