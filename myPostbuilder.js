// https://www.html5rocks.com/en/tutorials/workers/basics/#toc-inlineworkers
//
import fs from "fs"



// fs.writeFileSync("./toNPM/runPython.js", maincodeOut, {encoding: "utf8"})
fs.copyFileSync("./dist/taskcontroller.js", "./toNPM/taskcontroller.js")
fs.copyFileSync("./src/TaskController.d.ts", "./toNPM/taskcontroller.d.ts")
fs.copyFileSync("./dist/style.css", "./toNPM/style.css")
