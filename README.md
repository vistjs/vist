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

2. 测试驱动开发, 打开测试页面

```bash
yarn dev
```

3. 新增特性开发

- rtweb 注入页面的代码请看 `examples/src/index.tsx`
- 测试代码写入 `examples/src/pages`

# 特性

- [x] lerna, typescript, eslint, prettier, commintlint, lint stage 框架
- [x] record watch emit 队列, replay render frame
- [x] record & replay plugin
- [x] localdb save
- [x] package examples use create-react-app
- [ ] 支持所有 form 表单的输入录制
- [ ] 支持特殊的鼠标操作：hover、滚动、拖拽
- [ ] ctrl 插件。特性：可以识别快捷键，以浮层显示操作 UI。功能：结束录制、打截图断点
- [ ] 请求 record & mock 插件。 特性：可以拦截记录和 mock 所有请求，支持正则规则。功能：拦截记录到 server、从 server mock 请求
- [ ] 上传和下载 record 数据通过远程接口
- [ ] 支持嵌套的 iframe
- [ ] 支持录制第一帧视频

## 大版本特性

- [x] 支持 react
- [ ] 跟用例管理系统和回归运行系统打通
- [ ] 支持 vue
- [ ] 完善使用文档
- [ ] 支持 angular
