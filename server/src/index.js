
import { connectDB } from "./db/connection.js";
import { whatsappService } from "./controller/whatsapp.controller.js";
import { jiraService } from "./controller/jira.controller.js";
import { app } from "./app.js";

let db

const cleanUp=()=>{
    jiraService.unsubscribe()
}

try{
    db=await connectDB()
    await whatsappService.start()
    // jiraService.subscribe()

    process.on('SIGINT',cleanUp)
    process.on('SIGTERM',cleanUp)

    app.listen(8000,()=>console.log("App started listening..."))
}
catch(err){
    console.log(err)
    process.exit(1)
}
export {db}
