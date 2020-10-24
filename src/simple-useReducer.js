import render from './common';

let current = null;
let currentHook = null;// 所有钩子收集后移入 current

const isMountPhase = () => {// 判断是否首渲
  return current == null || current.hook == null;
};
  
const useReducer = (reducer, initialState) => {
  let hook;
  if (isMountPhase()){
    hook = { 
      context: current,// 持有 current，以便 setState 找到对应的渲染函数
      state: initialState, 
    };
    hook.dispatch = (action) => {
      const newState = reducer(action);
      hook.state = newState;
      current = hook.context;
      const vnodes = current.Component(current.props);
      render(vnodes);
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
  const [visible, dispatchVisible] = useReducer((action) => {
    if (action == 'show') return true;
    return false;
  }, false);
  console.log(`oops，可见性已经被小恶魔更新成${visible}了哦`);

  if (!immediateID){
    immediateID = setImmediate(() => {
      setCount(count + 1);
      dispatchVisible(!!visible ? 'hide' : 'show');
    });
  };
};

renderWithHooks(Component, {});
