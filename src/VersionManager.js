import { saveItem, loadItem } from "./StorageIndexedDb";
// @ts-ignore
import saveAction from "./img/menu/save-small.png";
// @ts-ignore
import runAction from "./img/menu/play-small.png";
// @ts-ignore
import leaveAction from "./img/menu/leave.png";
export class VersionManager {
    taskname;
    template;
    subscribers;
    opener;
    versions;
    constructor(config) {
        this.taskname = config.taskname;
        this.template = config.template || "";
        this.subscribers = config.subscribers || [];
        this.opener = config.opener;
        this.versions = [];
        this.addDomListeners();
        //this.globalizeIfTestViewer();
        this.init().then(_ => this.triggerInitDone());
    }
    addDomListeners() {
        const opener = this.opener;
        if (opener) {
            opener.querySelector(".version_suggestions")?.addEventListener("click", async (e) => {
                const target = e.target;
                const suggestion = target.closest('.version_suggestion');
                let dateToLoad = suggestion.dataset.version || "";
                await this.triggerLoading(this.versions.find(v => v?.timestamp === dateToLoad));
            });
            opener.querySelector(".toggle_autosaved")?.addEventListener("change", e => {
                opener.classList.toggle("show_autosaved", e.target.checked);
            });
            opener.querySelector(".toggle_autosaved")?.addEventListener("click", e => e.stopPropagation());
        }
    }
    async init() {
        this.versions = await this.getVersions();
        //await this.fetchTemplate();
        // //let versionScores = this.versions.map(v=>(!v.autosave?1:0)+(this.validator(v)?2:0));
        // let bestIndex = versionScores.findIndex(score=>score===Math.max(...versionScores));
        let bestVersion = this.versions.find(v => v.solvedstate) || this.versions[0];
        if (bestVersion) {
            await this.triggerLoading(bestVersion);
            return bestVersion;
        }
        else {
            console.log(`no versions found for ${this.getTaskname()}, will load template...`);
            return await this.loadTemplate();
        }
    }
    async isSolved() {
        let versions = this.versions || await this.getVersions();
        return versions.some(v => v.solvedstate);
    }
    async isSolvedByCurrent() {
        let versions = this.versions || await this.getVersions();
        return versions[0] && versions[0].solvedstate;
    }
    async isCurrentVersionSaved() {
        let versions = this.versions || await this.getVersions();
        return versions[0] && !versions[0].autosave;
    }
    async saveOrAutoSave(payload, autosave) {
        const value = autosave ? Object.assign({}, payload, { autosave }) : payload;
        const lastVersion = this.versions[0] || { code: this.template || "" };
        if (autosave && Object.keys(payload).every(key => lastVersion[key] === payload[key]))
            return;
        let r = await saveItem(this.getTaskname(), value);
        console.log(r);
        //await this.validateAndSaveResult({...value, date: r.date});
        await this.getVersions();
    }
    //setValidator(validator) {this.validator = validator;}
    async validateAndSaveResult(v) {
        // let valid = await this.validator(v);
        // if(valid === true || valid === false) {
        //   await markSolved({item: this.getTaskname(), date: v.date, solvedstate: valid ? 1 : 0})
        // }
        // return valid;
        if (v)
            return;
    }
    async showOpener() {
        if (this.opener && this.opener.classList.toggle('open')) {
            window.addEventListener("click", () => this.opener.classList.remove('open'), { once: true });
        }
    }
    // async fetchTemplate() {
    //   let templates = await loadTemplate({item: this.getTaskname()});
    //   this.template = templates.filter(v=>!v.autosave)[0];
    //   return this.template;
    // }
    //
    // async loadTemplate() {
    //   await this.fetchTemplate();
    //   if(this.template) {
    //
    //     return this.template;
    //   }
    //   else {
    //     console.warn(`no template found for ${this.getTaskname()}, will load empty default task`);
    //   }
    // }
    async loadTemplate() {
        return await this.triggerLoading({ code: this.template });
    }
    async getVersions() {
        const versions = this.versions = await loadItem(this.getTaskname());
        console.log(versions);
        await this.displayVersions(versions);
        await this.versionsMayHaveChanged();
        await this.triggerVersionChange(versions);
        //TODO this.editor.querySelector('button[data-action="load"]').disabled = versions.length===0;
        return versions;
    }
    async displayVersions(versions) {
        const opener = this.opener;
        if (!opener)
            return;
        let pad2Digits = (n) => (String(n)).padStart(2, "0");
        opener.querySelector(".version_suggestions").innerHTML = "";
        for (let i = 0; i < versions.length; i++) {
            let v = versions[i];
            let versionDate = new Date(v.timestamp || "");
            let lastSave = versions.findIndex(i => !i.autosave);
            let isNewerThanLastSave = lastSave === -1 || i < lastSave ? "newerThanLastSave" : "";
            let today = isToday(versionDate) ? "heute, " : false;
            let dateToShow = today || pad2Digits(versionDate.getDate()) + "." + pad2Digits(versionDate.getMonth() + 1) + ".";
            //let valid = await this.validator(v);
            let valid = v.solvedstate === 1
                ? true :
                v.solvedstate === 0
                    ? false
                    : await this.validateAndSaveResult(v);
            let validatorClass = /*!isTestMode() &&*/ valid ? "correct" : valid === false ? "wrong" : "";
            let icon = v.autosave === "quit" ? leaveAction : v.autosave === "run" ? runAction : saveAction;
            opener.querySelector(".version_suggestions").innerHTML += `<div class='version_suggestion ${v.autosave || 'save'} ${validatorClass} ${isNewerThanLastSave}' data-version='${v.timestamp}'>
        <img src='${icon}'>${dateToShow} ${new Date(v.timestamp || "").toLocaleTimeString()}
      </div>`;
        }
    }
    async triggerLoading(version) {
        this.subscribers.forEach((subscriber) => {
            subscriber.loadVersion && subscriber.loadVersion(version);
        });
    }
    async triggerVersionChange(versions) {
        this.subscribers.forEach(subscriber => {
            subscriber.versionChange && subscriber.versionChange(versions);
        });
    }
    async triggerInitDone() {
        this.subscribers.forEach(subscriber => {
            subscriber.initDone && subscriber.initDone(this.versions, this.template);
        });
    }
    async versionsMayHaveChanged() {
        this.opener && this.opener.dispatchEvent(new CustomEvent("version-change", { detail: this.versions, bubbles: true }));
    }
    getTaskname() {
        return this.taskname;
    }
}
function isToday(someDate) {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear();
}
