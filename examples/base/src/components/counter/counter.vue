<template>
  <view class="counter-wrap">
    <text>{{ count }}</text>
    <button bindtap="add">add</button>
  </view>
</template>
<script>
import { connect } from 'empjs/redux'
import { add } from '../../store'
export default connect(
  state => ({ count: state.count }),
  dispatch => ({
    add: () => dispatch(add())
  })
)({
  configs: {
    component: true
  },
  data: {},
  methods: {}
})
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
