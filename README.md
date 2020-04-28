# empjs

:warning: 实验中

empjs 意为 enhanced miniprogram 增强版小程序

注：1.0.0 以下版本为测试版，不保证向下兼容

当前 Readme 对应版本：empjs@0.0.9

### 基础使用

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
const EmpjsPlugin = require('empjs/plugin')

module.exports = {
  mode: 'development',
  devtool: 'cheap-source-map',
  entry: path.resolve(__dirname, './src/app.vue'),
  module: {
    rules: [
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
    ]
  },
  stats: {
    children: false
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js',
    libraryTarget: 'commonjs2'
  },
  plugins: [new EmpjsPlugin()]
}
```

需要注意：

- mode 根据需要切换

- 入口文件必须为 app.vue
- 由于小程序不支持 eval 方法，所以 devtool 的值不能为 eval、cheap-eval-source-map、cheap-module-eval-source-map、eval-source-map
- 需要引入 EmpjsPlugin
- output 的 filename 需要为`bundle.js`，libraryTarget 需要为`commonjs2`

具体代码与原生小程序写法区别如下：

- 在 app.vue 中需要引入 createApp 方法并调用，createApp 在一个项目中只能调用一次

- 单文件组件，页面或组件的构造属性需要通过 export dault 的方式导出。引入页面或组件使用 import 的方式，并在`pages`或`components` 字段下声明。没有 json 配置，配置是在`configs`字段下以对象的方式声明
- 除了以上，app 构造属性的字段与原生基本一致，page、component 的属性遵照 Component 构造器的写法，[Component 构造器官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/custom-component/component.html)

一个简单的单文件示例：

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
    components: { counter },
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
```

### 进阶使用

##### redux

假定你有 redux 的知识，能写一个基本的 store。然后需要在 app.vue 里引入这个 store:

```js
<script>
import { createApp } from 'empjs'
import store from './store'
createApp({
  store,
  configs: {
    window: {
    },
    style: 'v2'
  }
})
</script>
```

再在组件中使用 empjs 提供的 connect 方法绑定数据和方法即可：

```js
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
  }
})
</script>
</style>
```

当然，为了异步处理，你可以引入 redux-thunk

上面的代码在`example/base`有完整示例

##### 引入原生小程序组件

现在 webpack module 配置中加上一条.wxml 的匹配（现暂不能与.vue 规则合并）：

```js
module: {
  rules: [
    {
      test: /\.(vue)$/,
      use: [
        {
          loader: 'empjs/loader'
        }
      ]
    },
    {
      test: /\.(wxml)$/,
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
  ]
}
```

然后在组件中直接引入（注意后缀需为`.wxml`）

```js
import originCom from '../../components/origin-com/origin-com.wxml'
```

后续和单文件组件使用相同

### 优势与不足

相比原生小程序优势：

- 单文件组件，相比拆分为 4 个文件更好维护
- 使用 webpack 工程化构建
- 支持 css 预编译语言

相比一些小程序框架优势：

- 更接近底层小程序，脱离了框架，可以加深对小程序本身的理解，而不是用开发 web 的思维去开发小程序

- 更加轻量，运行时代码更少。小程序相当于跑在客户端 webview 上的框架，本身就做了很多优化，个人觉得没有必要再进行二次封装优化
- 一些小程序框架单文件使用两个 script 标签包裹，一是 js 逻辑，另一个则是 json 配置。empjs 使用 import 的方式引入组件，增加 configs 字段描述配置(如下)。这样做一是更符合逻辑，二是 json 中不可写注释，体验较差，三是多了一个 json 字段的 script 标签，某些 vue 代码高亮和格式化插件会有问题

```html
<template>
  <view>
    <counter></counter>
  </view>
</template>
<script>
  import counter from '../../components/counter/counter.vue'
  export default {
    components: { counter },
    configs: {
      navigationBarTitleText: 'index'
    }
  }
</script>
<style></style>
```

- 配置`.css`、`.less`对应规则，在 style 块中也能生效
- 提供连接`redux`的`connect`方法，方便状态管理

不足：

- 只支持微信小程序。由于各小程序平台用户基数和精力有限，empjs 只支持微信小程序
- 过于简单，empjs 可以理解为一个 webpack-loader，十分简单。并未提供 cli，webpack 需要自己依照示例配置，扩展功能自行配置；~~诸如 mock 等功能，也需自己实现~~（mock 功能见 Q&A）
- 没有相应的组件库
- ~~不支持引入原生小程序~~ （这个已经支持了，见进阶使用）

### Q&A

##### empjs 有数据 mock 能力吗

empjs 本身不提供数据 mock 能力，但微信开发者工具本身提供 mock 能力，详见[官方文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/api-mock.html)

##### 如何使用云开发能力

其实非常简单，在项目根目录的 project.config.json`文件（如果没有就新建），加上两项配置即可：

```js
"miniprogramRoot": "dist/",
"cloudfunctionRoot": "cloud/"
```

cloud 是你云开发的文件目录(当然也可以取别的名字)。再用开发者工具打开项目根目录。注意，不是 dist 目录

原理就是告诉开发者工具你的小程序文件在 dist 目录下，云开发文件在 cloud 目录下

### Todo

- [x] 样例中增加 eslint 配置示例
- [x] 支持云开发
- [ ] 支持更多 css 预编译语言（当前支持 less）
- [x] 支持引入原生小程序
- [x] 引入 redux
