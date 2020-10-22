import render from './common';

const wrap = (Component, props) => {
  let firstRender = true;
  let state;

  const setState = newState => {
    state = newState;
    firstRender = false;
    const vNodes = Component(props, useState);
    render(vNodes, true);
  };

  const useState = initialState => {
    if (firstRender) state = initialState;
    return [state, setState];
  };

  const vNodes = Component(props, useState);
  render(vNodes, false);
};

const Component = (props, useState) => {
  const [count, setCount] = useState(0);
  console.log(`oops，计数值已经被小恶魔更新成${count}了哦`);

  setImmediate(() => {
    setCount(count + 1);
  });
};

wrap(Component, {});
