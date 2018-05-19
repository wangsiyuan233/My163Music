window.eventHub = {
  events: {}, // hash

  //发布：函数里的每个 data 都 call一遍
  emit(eventName, data){
    // for (var i = 0; i < array.length; i++) 遍历字符串
    // for(let key in this.events) 遍历数组
    for(let key in this.events){
      if(key === eventName){
        let fnList = this.events[key]
        fnList.map((fn)=>{fn.call(undefined, data)})
      }
    }
  },

   //订阅fn
  on(eventName, fn){
    if(this.events[eventName] === undefined){
      this.events[eventName] = []
    }
    this.events[eventName].push(fn)
  },
}
