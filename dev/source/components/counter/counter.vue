<template>
  <view class="counter-wrap">
    <text>{{ count }}</text>
    <button bindtap="add">add</button>
  </view>
</template>
<script>
export default {
  _configs: {
    component: true
  },
  data: {
    count: 0
  },
  methods: {
    add() {
      this.setData({
        count: this.data.count + 1
      })
    }
  }
}
</script>
<style>
.counter-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 200px;
  padding: 25px 0;
}
</style>
