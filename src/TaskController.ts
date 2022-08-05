import './css/editor.css'

import {Editor, IEditorState, TMode} from "3e8-editor";
import TaskMenu from "./TaskMenu";
import {IVersion, Tautosave, VersionManager} from "./VersionManager";
import {runPython} from "3e8-run-python-skulpt"
// window.isTestMode = window.isTestMode || (()=>false);
// let runPython = window.runPython;
// import runJs from "../runJs.js";
const runJs = (...args: any[]) => console.log(args)

type Tvalidator = (code: string) => boolean

interface ITaskControllerConfig {
  taskname: string
  element: HTMLDivElement
  template?: string
  solution?: string
  runonload?: boolean
  validator?: Tvalidator
  mode: TMode
}

const editorHtml = `
<div class="eddy">
  <div class="menu"></div>
  <div class="version_opener"><div><label class="toggle_autosaved"><input type="checkbox">show autosaved</label><h4>Open version:</h4></div>
    <div class="version_suggestions"></div>
  </div>
  <div class="editor ace"></div>
  <div class="output"></div>
</div>
`

let tmpl = document.createElement('template');
tmpl.innerHTML = editorHtml;

/**
 * turns a given element into an MyEditor
 */
export class TaskController {
  element: HTMLDivElement
  outputElement: HTMLDivElement
  editor: Editor
  menu: TaskMenu
  versionManager: VersionManager
  taskname: string
  template: string
  solution?: string
  runonload: boolean
  mode: TMode

  constructor(config: ITaskControllerConfig, editorState: Partial<IEditorState>) {
    this.taskname = config.taskname
    this.template = config.template || ""
    this.runonload = config.runonload || false
    this.solution = config.solution
    const element: HTMLDivElement = this.element = config.element || document.querySelector(".task")!
    element.innerHTML = "";
    element.appendChild(tmpl.content.cloneNode(true));
    const editorElement: HTMLDivElement = element.querySelector(".editor")!;
    const menuElement: HTMLDivElement = element.querySelector(".menu")!;
    const versionOpener: HTMLDivElement = element.querySelector(".version_opener")!;
    this.outputElement = element.querySelector(".output")!;
    this.mode = config.mode || editorState.mode || "python"
    this.editor = new Editor({
      ...editorState,
      mode: this.mode,
      element: editorState.element || editorElement,
    });
    this.menu = new TaskMenu({menuElement, master: this});
    element.addEventListener("my-resize", _=>this.editor.resize());
    element.addEventListener("version-change", _=>this.addClassSavedOrSolved());
    this.editor.editorState.element.addEventListener("my-save", _=>this.save());
    window.addEventListener("beforeunload", async ()=>this && await this.saveOrAutoSave("quit"));
    this.versionManager = new VersionManager({subscribers: [this], opener: versionOpener, taskname: this.taskname, template: this.template});
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

  async showOpener(e: MouseEvent) {
    e.stopPropagation();
    return this.versionManager.showOpener();
  }

  async save() {
    return this.saveOrAutoSave(false);
  }

  async loadTemplate() {
    let template = await this.versionManager.loadTemplate();
    console.log({template});
  }

  async toggleSolution() {
    console.log(123);
    this.element.style.position = "relative";
    let existing = this.element.querySelector(".solution.wrap")
    if(existing) {
      this.element.removeChild(existing);
      return
    }
    this.element.insertAdjacentHTML("beforeend", `
      <div class="solution wrap"><button class="closeSolution">Close</button><div class="solution ace editor"></div></div>
    `)
    let solutionDiv: HTMLDivElement = this.element.querySelector(".solution.editor")!
    this.element.querySelector(".closeSolution")!.addEventListener("click", ()=>this.toggleSolution())
    console.log(this.solution);
    new Editor({element: solutionDiv, code: this.solution, mode: this.mode, theme: this.editor.editorState.theme, fontSize: 13, readOnly: true, showGutter: false, showLineNumbers: false})
  }

  async saveOrAutoSave(autosave: Tautosave=false) {
    let code = this.editor.getValue();
    let payload = {code};
    return await this.versionManager.saveOrAutoSave(payload, autosave);
  }

  async loadVersion(version: IVersion) {
    this.setValue(version.code);
    if(this.runonload) this.run().catch(console.warn);
  }

  resize() {
    this.editor.resize();
  }

  setFontSize(val: number) {
    this.editor.setFontSize(val);
  }

  setValue(code: string) {
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

  async hasSolvedVersion() {return this.versionManager.isSolved();}

  async run() {
    this.saveOrAutoSave("run").catch(console.warn);
    this.triggerRunEvent(this.getValue());
    if(this.mode === "python") {
      return runPython && await runPython({code: this.getValue(), outputElement: this.outputElement, show: (data: any)=>Math.random()<0.001&&console.log("Look", data)});
    }
    if(this.mode === "javascript") {
      let errors = this.editor.getAnnotations().filter(a=>a.type==="error");
      return await runJs(this.getValue(), this.outputElement, errors, (data: any)=>console.log("Look", data));
    }

    //
    //return runCode(this.editor.getValue(), errors) //in other script tag for non-strict evaluation
  }

  async quit() {
    return this.saveOrAutoSave("quit");
  }
  
  initDone(versions: any, template: any) {
     let event = new CustomEvent("init-done", {"detail": {versions, template}, bubbles: true});
    this.element.dispatchEvent(event);
  }

  triggerRunEvent(code: string) {
    let event = new CustomEvent("run-code", {"detail": {code}, bubbles: true});
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