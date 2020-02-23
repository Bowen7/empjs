# empjs

:warning: 实验中

empjs 意为 enhanced miniprogram 增强版小程序

### 使用

安装：`npm install empjs`

##### 运行示例：

git clone git@github.com:Bowen7/empjs.git

再到 examples/base 目录下执行

`npm install`

`npm run dev`

用微信开发者工具打开 examples/base/dist 目录即可查看效果

##### webpack 基本配置：

```js
const path = require('path')
const createRules = require('empjs/rules')

module.exports = {
  mode: 'development',
  devtool: 'cheap-source-map',
  entry: path.resolve(__dirname, './src/app.vue'),
  module: {
    rules: createRules([
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'empjs/loader'
          }
        ]
      },
      {
        test: /\.css$/,
        use: [{ loader: 'css-loader' }]
      }
    ])
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js',
    libraryTarget: 'commonjs2'
  }
}
```

需要注意：

- mode 根据需要切换

- 入口文件必须为 app.vue
- 由于小程序不支持 eval 方法，所以 devtool 的值不能为 eval、cheap-eval-source-map、cheap-module-eval-source-map、eval-source-map
- rules 字段必须经过 createRules 方法处理。这里是为了让单文件的各个代码块得到相应的 loader 处理。比如上面的配置，.vue 文件下的 style 标签块就会经过 css-loader 处理
- output 的 filename 需要为`bundle.js`，libraryTarget 需要为`commonjs2`

具体代码与原生小程序写法区别如下：

- 在 app.vue 中需要引入 createApp 方法并调用，createApp 在一个项目中只能调用一次

- 单文件组件，页面或组件的构造属性需要通过 export dault 的方式导出。引入页面或组件使用 import 的方式，并在`_pages`或`_components` 字段下声明。没有 json 配置，配置是在`_configs`字段下以对象的方式声明
- app、page、component 构造属性的字段与原生基本一致，与原生不同的只有`_configs`,`_pages`,`_components`三个字段，并且为了和原生区分，均已加上前缀''`_`''

部分文件如下：

app.vue

```html
<script>
  import indexPage from './pages/index/index.vue'
  import logsPage from './pages/logs/logs.vue'
  import { createApp } from 'empjs'
  createApp({
    _configs: {
      window: {
        backgroundTextStyle: 'light',
        navigationBarBackgroundColor: '#fff',
        navigationBarTitleText: 'WeChat',
        navigationBarTextStyle: 'black'
      },
      style: 'v2'
    },
    _pages: [indexPage, logsPage],
    onLaunch: function() {
      console.log('app launch')
    }
  })
</script>
```

index.vue

```html
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
    color: aliceblue;
  }
</style>
```

counter.vue

```html
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
```

### 优势与不足

相比原生小程序优势：

- 单文件组件，相比拆分为 4 个文件更好维护
- 使用 webpack 工程化构建
- 支持 css 预编译语言

相比一些小程序框架优势：

- 更加轻量，运行时代码更少。小程序相当于跑在客户端 webview 上的框架，本身就做了很多优化，没有必要再进行二次封装优化
- 一些小程序框架单文件使用两个 script 标签包裹，一是 js 逻辑，另一个则是 json 配置。empjs 使用 import 的方式引入组件，增加\_configs 字段描述配置(如下)。这样做一是更符合逻辑，二是 json 中不可写注释，体验较差，三是多了一个 json 字段的 script 标签，某些 vue 代码高亮和格式化插件会有问题

```html
<template>
  <view>
    <counter></counter>
  </view>
</template>
<script>
  import counter from '../../components/counter/counter.vue'
  export default {
    _components: { counter },
    _configs: {
      navigationBarTitleText: 'index'
    }
  }
</script>
<style></style>
```

- 配置更加灵活，使用提供的 createRules 方法创建 rules：

```js
module.exports = {
  // 其他配置
  module: {
    rules: createRules([
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'empjs/loader'
          }
        ]
      },
      {
        test: /\.css$/,
        use: [{ loader: 'css-loader' }]
      }
    ])
  }
}
```

经过 createRules 方法后，.vue 文件的 style 标签也会经过 css-loader 处理，这样我们可以更加方便地指定 loader 来处理单文件组件的各个代码块

不足：

- 只支持微信小程序。由于各小程序平台用户基数和精力有限，empjs 只支持微信小程序
- 过于简单，empjs 可以理解为一个 webpack-loader，十分简单。并未提供 cli，需要自己配置；诸如 mock 等功能，也需自己实现
- 没有相应的组件库
- 暂不支持引入原生小程序（这个可以考虑支持）

### Todo

- [x] 样例中增加 eslint 配置示例 (2020.1.31 号已增加，examples/base 目录下)
- [ ] 支持云开发
- [ ] 支持更多 css 预编译语言
- [ ] 支持引入原生小程序
- [ ] 增加测试
