export declare type Tautosave = false | "quit" | "run";
export interface IVersion {
    code: string;
    timestamp?: string;
    solvedstate?: 0 | 1;
    autosave?: Tautosave;
}
interface ISubcriber {
    initDone: (versions: IVersion[], template: string) => void;
    loadVersion: (version: IVersion) => void;
    versionChange?: (versions: IVersion[]) => void;
}
interface IVersionManagerConfig {
    taskname: string;
    template?: string;
    subscribers?: ISubcriber[];
    opener?: HTMLDivElement;
}
export declare class VersionManager {
    taskname: string;
    template: string;
    subscribers: ISubcriber[];
    opener?: HTMLDivElement;
    versions: IVersion[];
    constructor(config: IVersionManagerConfig);
    addDomListeners(): void;
    init(): Promise<void | IVersion>;
    isSolved(): Promise<boolean>;
    isSolvedByCurrent(): Promise<0 | 1 | undefined>;
    isCurrentVersionSaved(): Promise<boolean>;
    saveOrAutoSave(payload: IVersion, autosave: Tautosave): Promise<void>;
    validateAndSaveResult(v: IVersion): Promise<void>;
    showOpener(): Promise<void>;
    loadTemplate(): Promise<void>;
    getVersions(): Promise<IVersion[]>;
    displayVersions(versions: IVersion[]): Promise<void>;
    triggerLoading(version: IVersion): Promise<void>;
    triggerVersionChange(versions: IVersion[]): Promise<void>;
    triggerInitDone(): Promise<void>;
    versionsMayHaveChanged(): Promise<void>;
    getTaskname(): string;
}
export {};
