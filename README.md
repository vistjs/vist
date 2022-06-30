# rtweb

record and test the web

# 技术栈

- [lerna + yarn](https://juejin.cn/post/6844904112534847501) -- 包管理
- create-react-app -- demo
- [rrweb](https://github.com/rrweb-io/rrweb/blob/master/docs/recipes/dive-into-event.md) -- oplogs record
- typescript、eslint、prettier
- [mobx](https://www.mobxjs.com/reactions#reaction)
- webpack

# 开发

1. 安装依赖

```bash
yarn install
```

2. 测试驱动开发, 打开 live demo 页面

```bash
yarn dev
```

> 断点产生截图的快捷键是'ctrl+c', 结束录制的快捷键是'ctrl+s'
>
> 结束录制后在 replay 页面就能重放刚录制的操作
>
> url 中加入 record=1 就是 replay 页面, http://localhost:3000/?recordId=1

3. 新增特性开发

- rtweb 注入页面的代码请看 `examples/src/index.tsx`
- 测试代码写入 `examples/src/pages`

# CHANGES

## v1 特性

- [x] 支持 react
- [x] lerna, typescript, eslint, prettier, commintlint, lint stage 框架
- [x] record watch emit 队列, replay render frame
- [x] record & replay plugin
- [x] localdb save
- [x] package examples use create-react-app
- [x] 支持所有 form 表单的输入录制
- [x] 支持特殊的鼠标操作：hover、滚动、拖拽
- [x] 请求 record & mock 插件。 特性：可以拦截记录和 mock 所有请求，支持正则规则。功能：拦截记录到 server、从 server mock 请求
- [x] ctrl 插件。特性：可以识别快捷键。功能：结束录制、打截图断点

## v2 特性

- [ ] 跟用例管理系统和回归运行系统打通
- [ ] 支持嵌套的 iframe
- [ ] 支持录制第一帧视频
- [ ] ctrl 插件 UI 界面
- [ ] 支持 vue
- [ ] 完善使用文档
- [ ] 支持 angular
