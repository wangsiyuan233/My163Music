# 网页云音乐

## 一、admin页面

### 

【平均用时 5.2 天】
【难度：❀ ❀ ❀ ❀ ❀】
[【我的代码】](https://github.com/wangsiyuan233/My163Music/tree/master/js/admin)
[【效果预览】](#)<br>

- 第一步：在 `upload-song.js` 中 用文档 取到歌曲的 `url` 和 `name`;

- 第二步：找到一个【中枢】
比如可以在 `song-form.js` 写成 `window.app.song-form = controller`
这种方法可以将单独的js模块暴露出来 （所有的名字都要在` app.js` 里面展示出来）
可以：`window.app.song-form.reset()` 直接调用模块的方法
【BUT】耦合使得模块之间相互依赖，改动非常不方便
所以我们需要 一个【订阅发布模块】 —— event-hub
此时就不要 `app.js` 了

- 第三步：拖拽歌曲上传，自动显示歌名和外链
在 `song-form.js`/ `view.render()` 里面，先定义一个占位符 `placeholder`;
用 `replace()` 方法 ,不管用户有没有输入，都替换为 `data[string]`

- 第四步：取消 `songList` 高亮： 如果上传了歌曲，就取消高亮
 `window.eventHub.on('new',()=>{this.view.clearActive()})`
`.active` 是 `css` 里面的高亮代码

- 第五步：一开始就把【新建歌曲】这四个字高亮
`new-song.js` 的 `controller` 中添加 `this.active()`

- 第六步：点击【保存】 操作数据库，真正的保存起来
在 `av.js`里面初始化AV对象 （使用qiniu提供的API）
`song-form.js` 的 `controller` 中添加 `bindEvents()` 监听 `submit` 事件；
`song-form.js` 的 `controller` 中添加 `create()` 方法，遍历 `needs` 里面特定的字符串
`song-form.js` 的 `model` 中添加 `create()` 方法 ， 抄文档

- 第七步： 添加 `song-list`
左边的 `song-list` 初始是个空列表; 第六步保存到数据库的同时，更新 `song-list`
`song-list.js`/ `view.render(data)`/ `$liList`, 生成列表并且高亮
`songList-container` 清空后 `domLi` 添加在 `ul` 上
需要注意的是：深拷贝的对象会发生改变，每次都要使用最新的数据

【急需升级】：代码太复杂了，需要 `<li v-for>` & 深拷贝（操作数据库的时候就不会把另一个数据库的数据更改了）& eventHub

- 第八步： 【查】  刷新页面后，上传到后台的数据不会消失
`song-list.js` / `model` / `find() `抄文档
`song-list.js` / `controller` / `getAllSongs()`  调用 `find()`

- 第九步： 【改】  点击 `songList` 里面的条目，【新建歌曲】这四个字取消高亮 && 在右边的 `songform` 里面 显示歌曲的详情
首先在 `song-list` / `controller` / `bindEvents()` 取到的 `song.id` 值
如果有人选中了歌曲，就在 `new-song.js` 里面 `deactive()`； 【新建歌曲】这四个字取消高亮
`song-list.js` 把 点击了的 `data` 深拷贝后 发到 `event-hub.js` 上；（`data` 是取的 歌曲的  `song.id`)
`song-form.js` 去 `even-hub.js` 上 取到 `data`，对 `data` 进行渲染， 输入框了就能出现歌曲详情了！
同时需要更改： `song-form.js` / `view` / `render()` / 把【新建歌曲】改成【编辑歌曲】

- 第十步： 【增】
——>做判断前：上传歌曲成功，点击【保存】按钮之前；点击了【新建歌曲】按钮，表单就会清空
需要在 `song-form.js` / `controller` / `window.eventHub.on('new', (data)=>{}`) 做判断
如果 新上传的 `id` 在数据库里，说明是重复歌曲，可以清空表单
如果 `id` 不在 数据库，说明就是要上传的新歌曲啊，干嘛清空我！——>深拷贝一下数据

——>做完判断后：上传歌曲成功，点击【保存】按钮之前; 此时歌曲还没有 `song.id`（即使是同一首歌）,
点击【新建按钮】，判定为编辑状态，不会清空表单
接着，点击一个 `song-list` 里面的项目，表单自动填充为以前保存成功的歌曲（有 `song.id` )；
再次点击【新建按钮】表单就会被清空

- 第十一步： 【删】

- 第十二步： 【权限管理】

## 二、index页面

###