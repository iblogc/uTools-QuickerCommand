import { reactive } from "vue";
import quickcommandParser from "js/common/quickcommandParser.js";
import importAll from "js/common/importAll.js";
import utoolsFull from "js/utools.js";

// 默认命令
const defaultCommands = importAll(
  require.context("../json/", false, /\.json$/)
);

// 响应式状态
const state = reactive({
  allQuickCommands: {},
  allQuickCommandTags: [],
  activatedQuickCommandFeatureCodes: [],
  activatedQuickPanels: [],
});

// 使用函数工厂模式，确保每个组件获取自己的状态副本
export function useCommandManager() {
  // 获取已启用的命令
  const getActivatedFeatures = () => {
    let features = utoolsFull.whole.getFeatures();
    let currentFts = [];
    let quickpanels = [];
    features.forEach((x) =>
      x.code.slice(0, 6) == "panel_"
        ? quickpanels.push(window.hexDecode(x.code.slice(6)))
        : currentFts.push(x)
    );
    state.activatedQuickCommandFeatureCodes = currentFts.map((f) => f.code);
    state.activatedQuickPanels = quickpanels;
  };
  // 清除所有命令
  const clearAllFeatures = () => {
    for (var feature of utoolsFull.whole.getFeatures()) {
      if (feature.code.slice(0, 8) === "feature_") continue;
      utoolsFull.whole.removeFeature(feature.code);
    }
    state.activatedQuickCommandFeatureCodes = [];
  };
  // 获取所有的命令
  const getAllQuickCommands = () => {
    state.allQuickCommands = window.lodashM.cloneDeep(defaultCommands);
    utoolsFull.getAll("qc_").forEach((x) => {
      if (x.data.features.code.includes("default_")) return;
      state.allQuickCommands[x.data.features.code] = x.data;
    });
    getAllQuickCommandTags();
  };

  // 获取所有标签
  const getAllQuickCommandTags = () => {
    state.allQuickCommandTags = window.lodashM
      .union(...Object.values(state.allQuickCommands).map((x) => x.tags))
      .concat(["未分类"])
      .filter((x) => x);
  };

  // 保存命令
  const saveCommand = (command) => {
    const code = command.features.code;
    state.allQuickCommands[code] = command;

    if (!state.activatedQuickCommandFeatureCodes.includes(code)) {
      state.activatedQuickCommandFeatureCodes.push(code);
    }

    utoolsFull.whole.removeFeature(code);
    utoolsFull.whole.setFeature(command.features);

    if (!isDefaultCommand(code)) {
      utoolsFull.putDB(window.lodashM.cloneDeep(command), "qc_" + code);
    }

    getAllQuickCommandTags();
    return code;
  };

  // 删除命令
  const removeCommand = (code) => {
    utoolsFull.whole.copyText(
      JSON.stringify(state.allQuickCommands[code], null, 4)
    );
    delete state.allQuickCommands[code];
    utoolsFull.delDB("qc_" + code);
    removeCommandFromHistory(code);
    disableCommand(code);
    getAllQuickCommandTags();
    quickcommand.showMessageBox(
      "删除成功，为防止误操作，已将删除的命令复制到剪贴板",
      "success",
      1000,
      "bottom-right"
    );
  };

  // 从历史记录中删除命令
  const removeCommandFromHistory = (code) => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("editor_history_" + code)) {
        localStorage.removeItem(key);
      }
    }
  };

  // 启用命令
  const enableCommand = (code) => {
    utoolsFull.whole.setFeature(
      window.lodashM.cloneDeep(state.allQuickCommands[code].features)
    );
    state.activatedQuickCommandFeatureCodes.push(code);
  };

  // 禁用命令
  const disableCommand = (code) => {
    utoolsFull.whole.removeFeature(code);
    state.activatedQuickCommandFeatureCodes =
      state.activatedQuickCommandFeatureCodes.filter((x) => x !== code);
  };

  // 导入命令
  const importCommand = async (quickCommandInfo) => {
    if (!quickCommandInfo) {
      quickcommand.showMessageBox("导入未完成！", "warning");
      return false;
    }

    let parsedData = await quickcommandParser(quickCommandInfo);
    if (!parsedData) {
      quickcommand.showMessageBox("格式错误", "error");
      return false;
    }

    let dataToPushed = {};
    if (parsedData.single) {
      if (isDefaultCommand(parsedData.qc.features.code)) {
        quickcommand.showMessageBox("默认命令不能导入！", "error");
        return false;
      }
      dataToPushed[parsedData.qc.features.code] = parsedData.qc;
    } else {
      dataToPushed = parsedData.qc;
    }

    for (var code of Object.keys(dataToPushed)) {
      if (isDefaultCommand(code)) continue;
      utoolsFull.putDB(dataToPushed[code], "qc_" + code);
    }

    Object.assign(state.allQuickCommands, dataToPushed);
    getAllQuickCommandTags();
    quickcommand.showMessageBox("导入成功！");
    return parsedData.qc;
  };

  // 是否为默认命令
  const isDefaultCommand = (code) => {
    return code.slice(0, 8) === "default_";
  };

  // 导出所有命令
  const exportAllCommands = (saveAsFile = true) => {
    let options = {
      title: "选择保存位置",
      defaultPath: "quickCommand",
      filters: [{ name: "json", extensions: ["json"] }],
    };

    let commandsToExport = window.lodashM.cloneDeep(state.allQuickCommands);
    Object.keys(commandsToExport).forEach((code) => {
      if (isDefaultCommand(code)) delete commandsToExport[code];
    });

    let stringifyCommands = JSON.stringify(commandsToExport);
    if (saveAsFile) {
      return window.saveFile(stringifyCommands, options);
    } else {
      utoolsFull.whole.copyText(stringifyCommands);
      return true;
    }
  };

  // 清空所有命令
  const clearAllCommands = () => {
    exportAllCommands(false);
    utoolsFull.delAll("qc_");
    clearAllFeatures();
    getAllQuickCommands();
  };

  return {
    state,
    getAllQuickCommands,
    getAllQuickCommandTags,
    saveCommand,
    removeCommand,
    enableCommand,
    disableCommand,
    importCommand,
    isDefaultCommand,
    exportAllCommands,
    getActivatedFeatures,
    clearAllFeatures,
    clearAllCommands,
  };
}
