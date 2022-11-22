[![license](https://img.shields.io/github/license/Netflix/pollyjs.svg)](http://www.apache.org/licenses/LICENSE-2.0)

Vist 是一个轻便的 Web 网页录制回放测试工具，它使用浏览器原生 API 录制你的 Web 网页操作行为，以及回放你的浏览行为测试 Web 网页，同时它也录制浏览器发出的 http(s)请求。
它是下一代的 Web 网页 UI 测试工具，不需要编写任何测试脚本，同时它结合 [VTMS](https://github.com/vistjs/vtms) 系统，可以进行 UI 自动化回归测试，通过像素级的图像对比，它能快速发现版本迭代中的 UI 异常。

## 🎯 为什么需要 Vist?

Vist 出来之前，进行 UI 回归测试一般通过编写 Puppeter 或其他 E2E 框架脚本的方式，E2E 脚本的编写和维护往往成本很高，而用户页面出现 UI 异常常被认为不是非常严重的事故，导致业内一般认为 UI 回归测试是项 ROI 不高的技术投入。Vist 的出现将 UI 回归测试的成本降到最低，QA 或者 DEV 只需要设计出一条尽量简单的 Web 网页浏览操作路径，涵盖到需要进行 UI 回归的页面即可。浏览操作行为会被 Vist 规整为 Ops 上传到 [VTMS](https://github.com/vistjs/vtms) 系统，作为测试用例用于 UI 自动化回归测试。

## ✨ 特性

- 🌪 使用轻便，不需要安装浏览器插件或其他工具
- 💎 与 Web 网页采用的技术栈无关，支持主流的 Web 框架 React 和 Vue
- 🔥 不仅录制用户交互操作，而且可以配置录制请求，减少接口数据对回归测试的影响
- 📼 录制的数据可以存在本地用于回放，也可以上传到远程用于回归测试
- ⌨️ 支持各种表单输入、拖拽、滚动、鼠标移动等交互

## 📦 安装

```bash
npm install @vistjs/core
```

```bash
yarn add @vistjs/core
```

## 🔨 用法

```js
import Vist from '@vistjs/core';
new Vist({ remoteUrl: 'http://127.0.0.1:3000', pid: 1, requestMock: ['your.domain/api/**'] });
```

详细的参数说明如下：
| 参数 | 描述 | Type | 默认值 |
| ---------------- | -------------------------------------------------- | -------------------------------------------- | ---------------- |
| remoteUrl | 录制数据上传地址， 为空时数据保存在 localstorage | string | - |
| pid | 录制数据上传的项目 id | number | - |
| requestMock | 需要录制的 API 匹配模式，语法遵循[multimatch](https://www.npmjs.com/package/multimatch) | string[] | - |
| playParam | url 中输入的参数名用于启用回放测试模式 | string | 'recordId' |
| hotkeys | 配置录制的快捷键 | IHotkeys | - |

接口:

### IHotkeys

| Prop    | Description            | Type   | Default  |
| ------- | ---------------------- | ------ | -------- |
| stop    | 停止录制               | string | 'ctrl+s' |
| capture | 截屏断点               | string | 'ctrl+c' |
| replay  | 停止录制并马上回放测试 | string | 'ctrl+r' |

### 技巧

录制的时候，为了更精准定位元素，可以将鼠标先移动到元素上后稍微停顿，在进行点击等操作。

### examples

- [react](https://github.com/vistjs/vist/tree/master/packages/examples-react)
- [vue](https://github.com/vistjs/vist/tree/master/packages/examples-vue)

## License

MIT License

Copyright (c) 2022-present, letshare and Vist contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
