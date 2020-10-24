import render from './common';

let current = null;
let currentHook = null;// 所有钩子收集后移入 current
let didReceiveUpdate = false;// 状态更新标识

let timer = null;
const scheduleWork = () => {
  if (!timer) timer = setTimeout(() => {
    clearTimeout(timer);
    timer = null;

    const vNodes = current.Component(current.props);
    if (didReceiveUpdate) render(vNodes);
  }, 2000);
}

const isMountPhase = () => {// 判断是否首渲
  return current == null || current.hook == null;
};
  
const useReducer = (reducer, initialState) => {
  let hook;
  if (isMountPhase()){
    hook = { 
      context: current,// 持有 current，以便 setState 找到对应的渲染函数
      reducer,
      state: initialState, 
    };
    hook.dispatch = (action) => {
      const update = {
        reducer,
        action,
        eagerState: hook.state,
      };
      if (!hook.queue){
        const newState = reducer(action);
        hook.eagerState = newState;

        update.next = update;
        hook.queue = update;
      } else {
        update.next = hook.queue.next;
        hook.queue.next = update;
        hook.queue = update;
      };

      current = hook.context;
      if (hook.queue) scheduleWork();
    };

    if (!currentHook){
      currentHook = hook;// 首节点
      currentHook.next = hook;// 首尾相衔
    } else {
      hook.next = currentHook.next;// 首尾相衔
      currentHook.next = hook;// 尾节点
      currentHook = hook;
    };
  } else {
    hook = current.hook;
    current.hook = current.hook.next;// 下一个节点

    const firstUpdate = hook.queue.next;// 取链表头元素
    let update = firstUpdate;
    let newState = hook.state;

    while(update){
      newState = update.eagerState ? update.eagerState : update.reducer(update.action);
      if (hook.state != newState){// 模拟浅比较
        didReceiveUpdate = true;
        hook.state = newState;
      }
      update = update.next;
      if (update == firstUpdate) break;
    };
  };
  
  return [hook.state, hook.dispatch];
}
  
const useState = (initialState) => {
  const [state, dispatch] = useReducer((newState) => {
    return newState;
  }, initialState);
  
  return [state, dispatch];
}

const renderWithHooks = (Component, props) => {
  current = {
    Component,
    props,
    hook: null,
  };
  
  const vNodes = Component(props);
  render(vNodes);
  
  current.hook = currentHook.next;// 首节点
  currentHook = null;
  current = null;
};

let immediateID;
const Component = (props) => {
  const [count, setCount] = useState(0);
  console.log(`oops，计数值已经被小恶魔更新成${count}了哦`);

  if (!immediateID){
    immediateID = setImmediate(() => {
      setCount(1);
      setCount(2);
      setCount(2);
    });
  };
};

renderWithHooks(Component, {});
