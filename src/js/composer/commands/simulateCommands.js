export const simulateCommands = {
  label: "模拟操作",
  icon: "keyboard",
  defaultOpened: false,
  commands: [
    {
      value: "keyTap",
      label: "模拟按键",
      config: [],
      component: "KeyEditor",
    },
    {
      value: "utools.simulateMouseClick",
      label: "鼠标点击",
      allowEmptyArgv: true,
      config: [
        {
          label: "X坐标（留空则原地点击）",
          icon: "drag_handle",
          type: "input",
          inputType: "number",
          width: 8,
        },
        {
          label: "Y坐标（留空则原地点击）",
          icon: "drag_handle",
          type: "input",
          inputType: "number",
          width: 8,
        },
      ],
      functionSelector: {
        selectLabel: "鼠标动作",
        options: [
          {
            label: "单击",
            value: "utools.simulateMouseClick",
          },
          {
            label: "右击",
            value: "utools.simulateMouseRightClick",
          },
          {
            label: "双击",
            value: "utools.simulateMouseDoubleClick",
          },
        ],
        width: 2,
        allowEmptyArgv: true,
      },
    },
    {
      value: "utools.simulateMouseMove",
      label: "鼠标移动",
      config: [
        {
          label: "X坐标",
          icon: "drag_handle",
          defaultValue: 0,
          type: "input",
          inputType: "number",
          width: 8,
        },
        {
          label: "Y坐标",
          icon: "drag_handle",
          defaultValue: 0,
          type: "input",
          inputType: "number",
          width: 8,
        },
      ],
    },
    {
      value: "utools.getCursorScreenPoint",
      label: "获取鼠标坐标",
      config: [],
      allowEmptyArgv: true,
    },
    {
      value: "quickcomposer.simulate.findImage",
      label: "屏幕找图",
      component: "ImageSearchEditor",
      config: [],
      isAsync: true,
    },
  ],
};
