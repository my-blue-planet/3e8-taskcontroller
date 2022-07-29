// @ts-ignore
import saveIcon from "./img/menu/icon-save.png";
// @ts-ignore
import openIcon from "./img/menu/icon-open.png";
// @ts-ignore
import clearIcon from "./img/menu/icon-clear.png";
// @ts-ignore
import solutionIcon from "./img/menu/icon-solution.png";
// @ts-ignore
import undoIcon from "./img/menu/icon-undo.png";
// @ts-ignore
import redoIcon from "./img/menu/icon-redo.png";
// @ts-ignore
import runIcon from "./img/menu/icon-forward.png";
// @ts-ignore
import sizeUpIcon from "./img/menu/font-increase.png";
// @ts-ignore
import sizeDownIcon from "./img/menu/font-decrease.png";
const menuHtml = `
<div class="buttonrow">
  <button class='loadsave' data-action="save" title='Speichern'><img src='${saveIcon}' alt="save"/></button>
  <button class='loadsave' data-action="showOpener" title='Gespeicherte Version laden'><img src='${openIcon}' alt="open"/></button>
  <button data-action="loadTemplate" title='Vorlage neu laden'><img src='${clearIcon}' alt="loadTemplate"/></button>
  <button data-action="toggleSolution" title="Lösungsbeispiel anzeigen"><img src="${solutionIcon}"></button>
  <button data-action="undo" title='Rückgängig'><img src='${undoIcon}' alt="undo"/></button>
  <button data-action="redo" title='Wiederherstellen'><img src='${redoIcon}' alt="redo"/></button>
  <!--button data-action="beautify" title='Code formatieren'>:-)</button-->
  <button data-action="sizeup" title='Schrift vergrössern'><img src='${sizeUpIcon}' alt="font up"/></button>
  <button data-action="sizedown" title='Schrift verkleinern'><img src='${sizeDownIcon}' alt="font down"/></button>
  <!--<button data-action='ok'><img src='/img/menu/icon-ok.png'/></button>-->
  <button data-action="run" class="pressed" title="Code laufen lassen"><img src="${runIcon}"></button>
</div>
`;
let tmpl = document.createElement('template');
tmpl.innerHTML = menuHtml;
/**
 * turns an element into an Editor Menu
 */
export default class TaskMenu {
    master;
    constructor(config) {
        console.assert(!!config.master, "No master (editor, Field) provided");
        this.master = config.master;
        const elem = config.menuElement;
        elem.appendChild(tmpl.content.cloneNode(true));
        if (config.onlyLoadSave) {
            elem.querySelectorAll('button:not(.loadsave)').forEach(btn => btn.remove());
        }
        console.log(this.master.solution, "!!");
        if (!this.master.solution) {
            elem.querySelectorAll('button[data-action=toggleSolution]').forEach(btn => btn.remove());
        }
        elem.addEventListener("click", this.onClick.bind(this));
    }
    onClick(event) {
        let button = event.target.closest("button");
        let action = button && !button.disabled && button.dataset.action;
        if (action) {
            const myAction = action;
            this.master[myAction](event);
        }
    }
    ;
}
