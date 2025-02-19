<template>
  <div class="config-page-container">
    <!-- 主界面内容 -->
    <div class="main-content">
      <BackgroundLayer />
      <!-- 标签栏 -->
      <TagBar :tab-bar-width="tabBarWidth" />
      <CommandPanels
        :footer-bar-height="footerBarHeight"
        :tab-bar-width="tabBarWidth"
        @command-changed="commandChanged"
      />
      <!-- 底栏 -->
      <FooterBar
        :height="footerBarHeight"
        :left="tabBarWidth"
        @add-new="addNewCommand"
      />
    </div>

    <!-- 命令编辑界面 -->
    <transition name="slide">
      <div v-if="isEditorShow" class="editor-container">
        <component :is="editorComponent" @editorEvent="handleEditorEvent" />
      </div>
    </transition>

    <CommandRunResult ref="result"></CommandRunResult>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useCommandManager } from "js/commandManager.js";
import changeLog from "js/options/changeLog.js";
import { utoolsFull } from "js/utools.js";
import CommandEditor from "components/CommandEditor";
import ComposerEditor from "components/ComposerEditor";
import FooterBar from "src/components/config/FooterBar.vue";
import TagBar from "src/components/config/TagBar.vue";
import BackgroundLayer from "src/components/config/BackgroundLayer.vue";
import CommandPanels from "src/components/config/CommandPanels.vue";
const CommandRunResult = defineAsyncComponent(() =>
  import("components/CommandRunResult.vue")
);
// Performance Rendering > 300ms

export default {
  components: {
    CommandEditor,
    ComposerEditor,
    CommandRunResult,
    FooterBar,
    TagBar,
    BackgroundLayer,
    CommandPanels,
  },
  data() {
    return {
      commandManager: useCommandManager(),
      utools: utoolsFull,
      isEditorShow: false,
      commandEditorAction: {},
      footerBarHeight: "40px",
      editorComponent: "CommandEditor",
    };
  },
  computed: {
    allQuickCommands() {
      return this.commandManager.state.allQuickCommands;
    },
    allQuickCommandTags() {
      return this.commandManager.state.allQuickCommandTags;
    },
    currentTag: {
      get() {
        return this.commandManager.state.currentTag;
      },
      set(value) {
        this.commandManager.state.currentTag = value;
      },
    },
    // 标签栏宽度
    tabBarWidth() {
      return this.$root.profile.commandCardStyle === "mini" ? "0" : "80px";
    },
    fromNewCommand() {
      return this.$route.name === "newcommand";
    },
    fromImportCommand() {
      return this.$route.name === "importcommand";
    },
  },
  mounted() {
    this.initPage();
  },
  methods: {
    // 初始化
    initPage() {
      // newcommand 直接新建命令
      if (this.fromNewCommand) this.addNewCommand();
      // importcommand 导入命令
      else if (this.fromImportCommand)
        this.importCommand(this.$root.enterData.payload);
      this.$router.push("/configuration");
      if (this.$route.params.tags) {
        this.changeCurrentTag(window.hexDecode(this.$route.params.tags));
        this.$root.profile.commandCardStyle = "mini";
      }
      this.showChangeLog();
      // 异步读取
      // 获取所有已启用的命令的 features 以及面板名称
      setTimeout(this.commandManager.getActivatedFeatures(), 0);
      // 获取所有的命令（导出的格式）
      setTimeout(this.commandManager.getAllQuickCommands(), 0);
    },
    // 监听命令变更事件
    commandChanged(event) {
      switch (event.type) {
        case "remove":
          this.removeCommand(event.data);
          return;
        case "enable":
          this.enableCommand(event.data);
          return;
        case "disable":
          this.disableCommand(event.data);
          return;
        case "edit":
          this.editCommand(event.data);
          return;
        case "run":
          this.runCommand(event.data);
          return;
        default:
          return;
      }
    },
    changeCurrentTag(tagName) {
      this.commandManager.changeCurrentTag(tagName);
    },
    runCommand(code) {
      this.$refs.result.runCurrentCommand(this.allQuickCommands[code]);
    },
    // 启用命令
    enableCommand(code) {
      this.commandManager.enableCommand(code);
    },
    // 禁用命令
    disableCommand(code) {
      this.commandManager.disableCommand(code);
    },
    // 删除命令
    removeCommand(code) {
      this.commandManager.removeCommand(code);
      if (!this.allQuickCommandTags.includes(this.currentTag)) {
        this.changeCurrentTag("默认");
      }
    },
    // 编辑命令
    editCommand(commandOrCode) {
      // 即可传入 code，也可直接传入 command
      const command =
        typeof commandOrCode === "string"
          ? this.allQuickCommands[commandOrCode]
          : commandOrCode;
      this.editorComponent =
        command.program === "quickcomposer"
          ? "ComposerEditor"
          : "CommandEditor";
      this.commandManager.state.currentCommand =
        window.lodashM.cloneDeep(command);
      this.isEditorShow = true;
    },
    // 导入命令
    async importCommand(command) {
      const result = await this.commandManager.importCommand(command);
      if (result) {
        this.locateToCommand(result.tags, result.features?.code);
      }
    },
    // 定位命令, 包含changeCurrentTag
    locateToCommand(tags = ["默认"], code) {
      this.currentTag = !tags || !tags.length ? "未分类" : tags[0];
      if (!code) return;
      // 等待 dom 渲染
      this.$nextTick(() => {
        let el = document.getElementById(code);
        el.scrollIntoViewIfNeeded();
        el.querySelector(".q-card").style.boxShadow =
          "0px 1px var(--q-primary)";
        setTimeout(() => {
          el.querySelector(".q-card").style.boxShadow = "";
        }, 5000);
        // 跳转标签
        document
          .querySelector(".q-tab--active")
          .scrollIntoView({ behavior: "smooth" });
      });
    },
    // 新建命令
    addNewCommand(program = "quickcommand") {
      this.editorComponent =
        program === "quickcomposer" ? "ComposerEditor" : "CommandEditor";
      this.commandManager.state.currentCommand =
        this.commandManager.getDefaultCommand(program);
      this.isEditorShow = true;
    },
    saveCommand(command) {
      const code = this.commandManager.saveCommand(command);
      if (!code) return;
      this.locateToCommand(command.tags, code);
      quickcommand.showMessageBox("保存成功！");
    },
    handleEditorEvent(event, data) {
      switch (event) {
        case "save":
          this.saveCommand(data);
          break;
        case "back":
          this.isEditorShow = false;
          break;
        default:
          return;
      }
    },
    showChangeLog() {
      let lastNeedLogEvent = changeLog[changeLog.length - 1];
      let loggedVersion =
        this.utools.dbStorage.getItem("cfg_loggedVersion") || "0.0.0";
      if (loggedVersion < lastNeedLogEvent.version) {
        quickcommand.showConfirmBox(
          '<pre style="white-space: pre-wrap;word-wrap: break-word;">' +
            lastNeedLogEvent.log +
            "</pre>",
          "更新日志",
          true,
          700
        );
        this.utools.dbStorage.setItem(
          "cfg_loggedVersion",
          lastNeedLogEvent.version
        );
      }
    },
  },
};
</script>

<style scoped>
.config-page-container {
  position: relative;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.q-tab-panels {
  background: transparent;
}

.editor-container {
  color: var(--utools-font-color);
  overflow: hidden;
  position: fixed;
  inset: 0;
  z-index: 5000;
  background: var(--utools-bg-color);
}

/* 编辑器容器动画 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease-in-out;
}

.slide-enter-from {
  transform: translateY(100%);
}

.slide-leave-to {
  transform: translateY(100%);
}

.slide-enter-to,
.slide-leave-from {
  transform: translateY(0);
}
</style>
