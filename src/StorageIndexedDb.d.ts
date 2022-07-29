import { IVersion } from "./VersionManager";
declare function loadItem(item: string): Promise<IVersion[]>;
declare function saveItem(item: string, version: IVersion): Promise<unknown>;
export { loadItem, saveItem };
