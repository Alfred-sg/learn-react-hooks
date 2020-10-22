const mount = vNodes => {
  console.log('oops，小恶魔要开始挂载组件了哦');
};

const update = vNodes => {
  console.log('oops，小恶魔要开始更新组件了哦');
};

const render = (vNodes, isMounted) => {
  if (!isMounted) mount(vNodes);
  else update(vNodes);
};

export default render;
