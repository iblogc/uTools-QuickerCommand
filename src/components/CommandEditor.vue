<template>
  <div class="absolute-full container" style="overflow: 'hidden'">
    <!-- 命令设置栏 -->
    <CommandSideBar
      ref="sidebar"
      :canCommandSave="canCommandSave"
      :quickcommandInfo="quickcommandInfo"
      class="absolute-left shadow-10"
      :style="{
        width: sideBarWidth + 'px',
        zIndex: 1,
        // transition: '0.3s',
      }"
      v-if="showSidebar"
    ></CommandSideBar>
    <!-- 编程语言栏 -->
    <div
      class="absolute-top"
      :style="{
        left: showSidebar ? sideBarWidth + 'px' : 65,
        zIndex: 1,
        // transition: '0.3s',
      }"
    >
      <div class="row" v-show="!!languageBarHeight">
        <!-- 去掉收起侧栏功能，处理侧栏宽度变化时，Monaco调整大小导致ResizeObserver loop limit exceeded错误 -->
        <!-- <div class="col-auto flex">
          <q-btn v-if="!isRunCodePage" flat dense color="primary" class="menuBtn" icon="menu"
            @click="toggleSideBarWidth"><q-tooltip>{{ !!sideBarWidth ? "收起" : "展开" }}侧栏</q-tooltip></q-btn>
        </div> -->
        <div class="col">
          <div>
            <q-select
              dense
              standout="bg-primary text-white"
              square
              hide-bottom-space
              color="primary"
              transition-show="jump-down"
              transition-hide="jump-up"
              @update:model-value="programChanged"
              v-model="quickcommandInfo.program"
              :options="programLanguages"
              label="环境"
            >
              <template v-slot:append>
                <q-avatar size="lg" square>
                  <img :src="$root.programs[quickcommandInfo.program].icon" />
                </q-avatar>
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <img width="32" :src="$root.programs[scope.opt].icon" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label v-html="scope.opt" />
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </div>
        <q-separator vertical />
        <div class="col-auto justify-end flex">
          <q-btn-group unelevated>
            <q-btn-dropdown
              v-show="quickcommandInfo.program !== 'html'"
              style="padding: 0 10px"
              dense
              flat
              ref="settings"
              color="primary"
              :icon="
                quickcommandInfo.program === 'quickcommand'
                  ? 'insights'
                  : 'settings'
              "
            >
              <q-list>
                <!-- quickcommand系列按键 -->
                <q-item
                  clickable
                  v-for="(item, index) in ['keyboard', 'ads_click', 'help']"
                  :key="index"
                  @click="
                    [
                      () => (showRecorder = true),
                      () => (showActions = true),
                      showHelp,
                    ][index]
                  "
                  v-show="quickcommandInfo.program === 'quickcommand'"
                >
                  <q-item-section avatar>
                    <q-icon :name="item" />
                  </q-item-section>
                  <q-item-section>{{
                    ["录制按键", "快捷动作", "查看文档"][index]
                  }}</q-item-section>
                </q-item>
                <!-- 自定义解释器 -->
                <q-item
                  v-for="(item, index) in Object.keys(
                    quickcommandInfo.customOptions
                  )"
                  :key="index"
                  v-show="quickcommandInfo.program === 'custom'"
                >
                  <q-input
                    stack-label
                    autofocus
                    dense
                    outlined
                    class="full-width"
                    @blur="matchLanguage"
                    :label="
                      [
                        '解释器路径，如：/opt/python',
                        '运行参数，如：-u',
                        '脚本后缀，不含点，如：py',
                      ][index]
                    "
                    v-model="quickcommandInfo.customOptions[item]"
                  >
                    <template v-slot:prepend>
                      <q-icon name="code" />
                    </template>
                  </q-input>
                </q-item>
                <!-- 脚本参数 -->
                <q-item v-show="quickcommandInfo.program !== 'quickcommand'">
                  <q-input
                    dense
                    stack-label
                    outlined
                    label="脚本参数"
                    class="full-width"
                    v-model="quickcommandInfo.scptarg"
                  >
                    <template v-slot:prepend>
                      <q-icon name="input" />
                    </template>
                  </q-input>
                </q-item>
                <!-- 编码设置 -->
                <q-item
                  v-for="(item, index) in Object.keys(quickcommandInfo.charset)"
                  :key="index"
                  v-show="quickcommandInfo.program !== 'quickcommand'"
                >
                  <q-select
                    dense
                    outlined
                    stack-label
                    clearable
                    class="full-width"
                    :label="['脚本编码', '输出编码'][index]"
                    v-model="quickcommandInfo.charset[item]"
                    :options="['GBK', 'utf8', 'Big5']"
                    type="text"
                  >
                    <template v-slot:prepend>
                      <q-icon :name="['format_size', 'output'][index]" />
                    </template>
                  </q-select>
                </q-item>
              </q-list>
            </q-btn-dropdown>
            <q-separator vertical inset />
            <q-btn
              style="padding: 0 10px"
              dense
              flat
              color="primary"
              icon="play_arrow"
              label="运行"
              @click="runCurrentCommand()"
            ></q-btn>
            <q-btn
              flat
              style="padding: 0 10px"
              dense
              v-if="!isRunCodePage"
              :disable="!canCommandSave"
              :color="canCommandSave ? 'primary' : 'grey'"
              icon="save"
              label="保存"
              @click="saveCurrentCommand()"
            ></q-btn>
          </q-btn-group>
        </div>
        <q-dialog v-model="showActions">
          <QuickAction @addAction="insertText" />
        </q-dialog>
        <q-dialog v-model="showRecorder" position="bottom">
          <KeyRecorder @sendKeys="insertText" />
        </q-dialog>
      </div>
    </div>
    <MonacoEditor
      class="absolute-bottom"
      :placeholder="true"
      ref="editor"
      @loaded="monacoInit"
      @typing="(val) => monacoTyping(val)"
      @keyStroke="monacoKeyStroke"
      :style="{
        top: languageBarHeight + 'px',
        left: action.type === 'run' ? 0 : sideBarWidth + 'px',
        // transition: '0.3s',
      }"
    />
    <!-- 运行结果 -->
    <CommandRunResult :action="action" ref="result"></CommandRunResult>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import CommandSideBar from "components/CommandSideBar";
import CommandRunResult from "components/CommandRunResult";
import QuickAction from "components/popup/QuickAction";
import KeyRecorder from "components/popup/KeyRecorder";
// Performance Scripting > 500ms
const MonacoEditor = defineAsyncComponent(() =>
  import("components/MonacoEditor")
);

const defaultSideBarWidth = 250;
const defaultlanguageBarHeight = 40;

export default {
  components: {
    MonacoEditor,
    CommandSideBar,
    CommandRunResult,
    QuickAction,
    KeyRecorder,
  },
  data() {
    return {
      programLanguages: Object.keys(this.$root.programs),
      sideBarWidth: defaultSideBarWidth,
      languageBarHeight: defaultlanguageBarHeight,
      canCommandSave: this.action.type === "code" ? false : true,
      showActions: false,
      showRecorder: false,
      quickcommandInfo: {
        program: "quickcommand",
        cmd: "",
        scptarg: "",
        charset: {
          scriptCode: "",
          outputCode: "",
        },
        customOptions: {
          bin: "",
          argv: "",
          ext: "",
        },
      },
      resultMaxLength: 10000,
      showSidebar: this.action.type !== "run",
      isRunCodePage: this.action.type === "run",
      listener: null,
    };
  },
  props: {
    action: Object,
  },
  created() {
    this.commandInit();
  },
  mounted() {
    this.sidebarInit();
  },
  computed: {
    configurationPage() {
      return this.$root.$refs.view;
    },
    allQuickCommandTags() {
      return _.without(
        this.configurationPage.allQuickCommandTags,
        "默认",
        "未分类",
        "搜索结果"
        // "来自分享"
      );
    },
  },
  methods: {
    // 命令初始化
    commandInit() {
      let quickCommandInfo =
        this.action.type === "run"
          ? this.$root.utools.getDB("cfg_codeHistory")
          : this.action.data;
      quickCommandInfo?.program &&
        Object.assign(this.quickcommandInfo, _.cloneDeep(quickCommandInfo));
      // 默认命令不可编辑
      if (this.quickcommandInfo.tags?.includes("默认") && !utools.isDev()) {
        this.canCommandSave = false;
      }
    },
    // 侧边栏初始化
    sidebarInit() {
      this.$refs.sidebar?.init();
    },
    // Monaco编辑器初始化，Monaco异步加载完执行
    monacoInit() {
      this.$refs.editor.setEditorValue(this.quickcommandInfo.cmd);
      this.setLanguage(this.quickcommandInfo.program);
      this.$refs.editor.setCursorPosition(this.quickcommandInfo.cursorPosition);
    },
    programChanged(value) {
      this.setLanguage(value);
      if (value === "custom") this.$refs.settings.show();
      this.$refs.sidebar?.setIcon(value);
    },
    // 匹配编程语言
    matchLanguage() {
      if (!this.quickcommandInfo.customOptions.ext) return;
      let language = Object.values(this.$root.programs).filter(
        (program) => program.ext === this.quickcommandInfo.customOptions.ext
      );
      if (language.length) {
        this.setLanguage(language[0].name);
      }
    },
    // 设置编程语言
    setLanguage(language) {
      let highlight = this.$root.programs[language].highlight;
      this.$refs.editor.setEditorLanguage(highlight ? highlight : language);
    },
    insertText(text) {
      this.$refs.editor.repacleEditorSelection(text);
    },
    // 打开文档
    showHelp() {
      window.showUb.docs();
    },
    // 展开收起侧栏
    toggleSideBarWidth() {
      this.sideBarWidth = !!this.sideBarWidth ? 0 : defaultSideBarWidth;
    },
    // 保存
    saveCurrentCommand(config = { silent: false }) {
      let updatedData = this.$refs.sidebar?.SaveMenuData();
      if (!updatedData) return;
      Object.assign(this.quickcommandInfo, _.cloneDeep(updatedData));
      let newQuickcommandInfo = _.cloneDeep(this.quickcommandInfo);
      this.$root.utools.putDB(
        newQuickcommandInfo,
        "qc_" + this.quickcommandInfo.features.code
      );
      this.$emit("editorEvent", {
        type: "save",
        data: newQuickcommandInfo,
      });
      if (!config.silent)
        quickcommand.showMessageBox(
          "保存成功！",
          "success",
          1000,
          "bottom-right"
        );
    },
    // 运行
    runCurrentCommand(cmd) {
      this.saveCurrentCommand({ silent: true });
      let command = _.cloneDeep(this.quickcommandInfo);
      if (cmd) command.cmd = cmd;
      command.output =
        this.$refs.sidebar?.currentCommand.output ||
        (command.program === "html" ? "html" : "text");
      command.cmdType = this.$refs.sidebar?.cmdType.name;
      this.$refs.result.runCurrentCommand(command);
    },
    saveCodeHistory() {
      if (this.action.type !== "run") return;
      let command = _.cloneDeep(this.quickcommandInfo);
      command.cursorPosition = this.$refs.editor.getCursorPosition();
      this.$root.utools.putDB(command, "cfg_codeHistory");
    },
    monacoTyping(val) {
      this.quickcommandInfo.cmd = val;
    },
    monacoKeyStroke(event, data) {
      switch (event) {
        case "run":
          this.runCurrentCommand();
          break;
        case "save":
          this.saveCurrentCommand();
          break;
        case "log":
          if (this.quickcommandInfo.program !== "quickcommand") return;
          this.runCurrentCommand(`console.log(${data})`);
          break;
        default:
          break;
      }
    },
  },
};
</script>

<style scoped>
.menuBtn {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 0;
}

.body--dark .menuBtn {
  background: rgba(255, 255, 255, 0.07);
}
</style>
