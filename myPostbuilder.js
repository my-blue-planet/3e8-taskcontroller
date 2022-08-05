import fs from "fs"



// fs.writeFileSync("./toNPM/runPython.js", maincodeOut, {encoding: "utf8"})
fs.copyFileSync("./dist/taskcontroller.js", "./toNPM/taskcontroller.js")
fs.copyFileSync("./src/TaskController.d.ts", "./toNPM/taskcontroller.d.ts")
fs.copyFileSync("./src/TaskMenu.d.ts", "./toNPM/TaskMenu.d.ts")
fs.copyFileSync("./src/VersionManager.d.ts", "./toNPM/VersionManager.d.ts")
fs.copyFileSync("./dist/style.css", "./toNPM/style.css")
