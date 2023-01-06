import './css/editor.css';
import { Editor } from "3e8-editor";
import TaskMenu from "./TaskMenu";
import { VersionManager } from "./VersionManager";
import { runPython } from "3e8-run-python-skulpt";
// window.isTestMode = window.isTestMode || (()=>false);
// let runPython = window.runPython;
import { runJs } from "3e8-run-js";
const editorHtml = `
<div class="eddy">
  <div class="menu"></div>
  <div class="version_opener"><div><label class="toggle_autosaved"><input type="checkbox">show autosaved</label><h4>Open version:</h4></div>
    <div class="version_suggestions"></div>
  </div>
  <div class="editor ace"></div>
  <div class="output"></div>
</div>
`;
let tmpl = document.createElement('template');
tmpl.innerHTML = editorHtml;
/**
 * turns a given element into an MyEditor
 */
export class TaskController {
    element;
    outputElement;
    editor;
    menu;
    versionManager;
    taskname;
    template;
    solution;
    runningWorker;
    runonload;
    runConfig;
    beforeCode;
    afterCode;
    mode;
    constructor(config, editorState = {}) {
        this.taskname = config.taskname;
        this.template = config.template || "";
        this.runonload = config.runonload || false;
        this.solution = config.solution;
        this.runConfig = config.runConfig;
        this.beforeCode = config.beforeCode || "";
        this.afterCode = config.afterCode || "";
        const element = this.element = config.element || document.querySelector(".task");
        element.innerHTML = "";
        element.appendChild(tmpl.content.cloneNode(true));
        const editorElement = element.querySelector(".editor");
        const menuElement = element.querySelector(".menu");
        const versionOpener = element.querySelector(".version_opener");
        this.outputElement = element.querySelector(".output");
        this.mode = config.mode || editorState.mode || "python";
        this.editor = new Editor({
            ...editorState,
            mode: this.mode,
            element: editorState.element || editorElement,
        });
        this.menu = new TaskMenu({ menuElement, master: this });
        element.addEventListener("my-resize", _ => this.editor.resize());
        element.addEventListener("version-change", _ => this.addClassSavedOrSolved());
        this.editor.editorState.element.addEventListener("my-save", _ => this.save());
        window.addEventListener("beforeunload", async () => this && await this.saveOrAutoSave("quit"));
        this.versionManager = new VersionManager({ subscribers: [this], opener: versionOpener, taskname: this.taskname, template: this.template });
        this.addClassSavedOrSolved();
    }
    async addClassSavedOrSolved() {
        // if(window.isTestMode()) {
        //   let isSaved = await this.versionManager.isCurrentVersionSaved();
        //   this.element.querySelector(".eddy").classList.toggle("saved", isSaved || false);
        // }
        // else {
        //   let solved = await this.hasSolvedVersion();
        //   this.element.querySelector(".eddy").classList.toggle("solved", solved||false)
        // }
    }
    //setValidator(validator: Tvalidator) {this.versionManager.setValidator(validator);}
    async showOpener(e) {
        e.stopPropagation();
        return this.versionManager.showOpener();
    }
    async save() {
        return this.saveOrAutoSave(false);
    }
    async loadTemplate() {
        await this.versionManager.loadTemplate();
    }
    async toggleSolution() {
        this.element.style.position = "relative";
        let existing = this.element.querySelector(".solution.wrap");
        if (existing) {
            this.element.removeChild(existing);
            return;
        }
        this.element.insertAdjacentHTML("beforeend", `
      <div class="solution wrap"><button class="closeSolution">Close</button><div class="solution ace editor"></div></div>
    `);
        let solutionDiv = this.element.querySelector(".solution.editor");
        this.element.querySelector(".closeSolution").addEventListener("click", () => this.toggleSolution());
        new Editor({ element: solutionDiv, code: this.solution, mode: this.mode, theme: this.editor.editorState.theme, fontSize: 13, readOnly: true, showGutter: false, showLineNumbers: false });
    }
    async saveOrAutoSave(autosave = false) {
        let code = this.editor.getValue();
        let payload = { code };
        return await this.versionManager.saveOrAutoSave(payload, autosave);
    }
    async loadVersion(version) {
        this.setValue(version.code);
        if (this.runonload)
            this.run().catch(console.warn);
    }
    resize() {
        this.editor.resize();
    }
    setFontSize(val) {
        this.editor.setFontSize(val);
    }
    setValue(code) {
        this.editor.setValue(code);
    }
    getValue() {
        return this.editor.getValue();
    }
    async undo() {
        this.editor.undo();
    }
    async redo() {
        this.editor.redo();
    }
    async sizeup() {
        this.editor.sizeup();
    }
    async sizedown() {
        this.editor.sizedown();
    }
    async beautify() {
        console.log("beautify not implemented");
        //this.editor.beautify();
    }
    getTaskname() {
        return this.taskname;
    }
    async hasSolvedVersion() { return this.versionManager.isSolved(); }
    async run() {
        if (this.runningWorker)
            this.runningWorker.terminate();
        this.saveOrAutoSave("run").catch(console.warn);
        this.triggerRunEvent(this.getValue());
        const beforeCode = this.beforeCode ? this.beforeCode + ";" : "";
        if (this.mode === "python" && runPython) {
            this.runningWorker = runPython({
                code: beforeCode + this.getValue() + this.afterCode,
                outputElement: this.outputElement,
                show: (data) => console.log("Look", data),
                ...this.runConfig,
            });
            return this.runningWorker;
        }
        if (this.mode === "javascript") {
            let errors = this.editor.getAnnotations().filter(a => a.type === "error");
            this.runningWorker = runJs({
                code: beforeCode + this.getValue() + this.afterCode,
                outputElement: this.outputElement,
                show: (data) => console.log("Look", data),
                ...this.runConfig,
            });
        }
        //
        //return runCode(this.editor.getValue(), errors) //in other script tag for non-strict evaluation
    }
    async quit() {
        console.log("quit");
        if (this.runningWorker)
            this.runningWorker.terminate();
        return this.saveOrAutoSave("quit");
    }
    initDone(versions, template) {
        let event = new CustomEvent("init-done", { "detail": { versions, template }, bubbles: true });
        this.element.dispatchEvent(event);
    }
    triggerRunEvent(code) {
        let event = new CustomEvent("run-code", { "detail": { code }, bubbles: true });
        this.element.dispatchEvent(event);
    }
}
/* in case oonchange will be needed
    if(this.editor){
      this._ignoreChange = true;
      this.editor.setValue( val );
      this._ignoreChange = false;
    } else {
      this.textContent = val;
    }

        //   editor.getSession().on('change', (event) => {
    //     if (!this._ignoreChange) {
    //       element.dispatchEvent(new CustomEvent("change", {bubbles: true, composed: true, detail: event}));
    //     }
    //   });
 */
