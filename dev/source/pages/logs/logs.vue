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
.log-wrap {
  text-align: center;
  margin-top: 200px;
}
.log {
  color: gray;
}
</style>
