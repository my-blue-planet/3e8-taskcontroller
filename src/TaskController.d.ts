import './css/editor.css';
import { Editor, IEditorState, TMode } from "3e8-editor";
import TaskMenu from "./TaskMenu";
import { IVersion, Tautosave, VersionManager } from "./VersionManager";
declare type Tvalidator = (code: string) => boolean;
interface ITaskControllerConfig {
    taskname: string;
    element: HTMLDivElement;
    template?: string;
    solution?: string;
    runonload?: boolean;
    validator?: Tvalidator;
    mode: TMode;
}
/**
 * turns a given element into an MyEditor
 */
export declare class TaskController {
    element: HTMLDivElement;
    outputElement: HTMLDivElement;
    editor: Editor;
    menu: TaskMenu;
    versionManager: VersionManager;
    taskname: string;
    template: string;
    solution?: string;
    runonload: boolean;
    mode: TMode;
    constructor(config: ITaskControllerConfig, editorState: Partial<IEditorState>);
    addClassSavedOrSolved(): Promise<void>;
    showOpener(e: MouseEvent): Promise<void>;
    save(): Promise<void>;
    loadTemplate(): Promise<void>;
    toggleSolution(): Promise<void>;
    saveOrAutoSave(autosave?: Tautosave): Promise<void>;
    loadVersion(version: IVersion): Promise<void>;
    resize(): void;
    setFontSize(val: number): void;
    setValue(code: string): void;
    getValue(): string;
    undo(): Promise<void>;
    redo(): Promise<void>;
    sizeup(): Promise<void>;
    sizedown(): Promise<void>;
    beautify(): Promise<void>;
    getTaskname(): string;
    hasSolvedVersion(): Promise<boolean>;
    run(): Promise<void | Worker>;
    quit(): Promise<void>;
    initDone(versions: any, template: any): void;
    triggerRunEvent(code: string): void;
}
export {};
