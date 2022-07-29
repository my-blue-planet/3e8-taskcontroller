import {IVersion} from "./VersionManager";

let db: IDBDatabase;
const dbconn = window.indexedDB.open("myplanet", 1);

async function waitForDb(i: number) {
  return new Promise(async (resolve)=>{
    console.log("waitForDb", i);
    if(db) resolve(db)
    else {
      await new Promise(r=>setTimeout(r, 100))
      resolve(await waitForDb(i+1))
    }
  })
}

dbconn.onerror = (event) => {
  console.warn("no idb available", event);
};

dbconn.onupgradeneeded = () => {
  const db = dbconn.result
  if(!db.objectStoreNames.contains('versions')) {
    const versionStore = db.createObjectStore('versions', {keyPath: 'id'});
    versionStore.createIndex("taskname", "taskname")
  }
}
dbconn.onsuccess = () => {
  db = dbconn.result
  db.onerror = (event) => {
    console.error("Database error: " + (event.target as unknown as {errorCode: any}).errorCode);
  };
}


async function loadItem(item: string): Promise<IVersion[]> {
  await waitForDb(0)
  return new Promise((resolve, reject) => {
    let transaction = db.transaction("versions", "readonly")
    let versions = transaction.objectStore("versions")
    let taskIndex = versions.index("taskname");
    let request = taskIndex.getAll(item);
    request.onsuccess = () => resolve(request.result.reverse());
    request.onerror = reject
  })
}

async function saveItem(item: string, version: IVersion) {
  await waitForDb(0)
  return new Promise((resolve, reject) => {
    let transaction = db.transaction("versions", "readwrite")
    let versions = transaction.objectStore("versions")
    const timestamp = new Date().toISOString()
    const saveversion = {
      id: item + "_" + timestamp,
      taskname: item,
      timestamp,
      ...version
    };
    let request = versions.add(saveversion);
    request.onsuccess = resolve
    request.onerror = reject;
  })
}

export {loadItem, saveItem};