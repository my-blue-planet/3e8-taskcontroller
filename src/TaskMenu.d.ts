import { TaskController } from "./TaskController";
interface ITaskMenuConfig {
    menuElement: HTMLDivElement;
    master: TaskController;
    onlyLoadSave?: boolean;
}
/**
 * turns an element into an Editor Menu
 */
export default class TaskMenu {
    master: TaskController;
    constructor(config: ITaskMenuConfig);
    onClick(event: MouseEvent): void;
}
export {};
