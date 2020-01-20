<template>
  <view class="log-wrap">
    <text class="log">{{ logText }}</text>
  </view>
</template>
<script>
import { getCurTime } from '../../utils/util'
export default {
  _configs: {
    navigationBarTitleText: 'logs'
  },
  data: {
    logText: ''
  },
  onLoad() {
    const logText = getCurTime()
    this.setData({
      logText
    })
  }
}
</script>
<style>
.title-wrap {
  text-align: center;
  margin-top: 200px;
}
.title {
  color: gray;
}
.btn {
  margin-top: 100px;
}
</style>
