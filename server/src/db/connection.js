
import sqlite3 from "sqlite3";
import path from "path"
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectDB=()=>{
    return new Promise((resolve,reject)=>{
        const dbPath = path.join(__dirname, './data/whatsapp.db');
        const db=new sqlite3.Database(dbPath,(err)=>{
            db.serialize(()=>{
                db.run(`DROP TABLE IF EXISTS issues`)
                db.run(`
                    CREATE TABLE IF NOT EXISTS issues (
                    id TEXT PRIMARY KEY,
                    title TEXT,
                    description TEXT,
                    status TEXT DEFAULT 'open',
                    priority TEXT DEFAULT 'medium',
                    assignee TEXT,
                    team_name TEXT,
                    whatsapp_group_id TEXT,
                    reporter_id TEXT,
                    jira_id TEXT,
                    current_step TEXT,
                    issue_created boolean,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    resolved_at DATETIME)
                `)
                // db.run(`
                //     CREATE TABLE IF NOT EXISTS whatsapp_messages (
                //     id TEXT PRIMARY KEY,
                //     group_id TEXT,
                //     group_name TEXT,
                //     sender_id TEXT,
                //     sender_name TEXT,
                //     message TEXT,
                //     timestamp DATETIME,
                //     is_processed BOOLEAN DEFAULT 0,
                //     extracted_issues TEXT
                //     )
                // `)
                db.run(`
                    CREATE TABLE IF NOT EXISTS groups (
                    group_id TEXT PRIMARY KEY,
                    group_name TEXT,
                    group_description TEXT
                    )
                `,)
                db.run(`
                    CREATE TABLE IF NOT EXISTS assignees (
                    id TEXT PRIMARY KEY,
                    name TEXT,
                    shift_start TEXT,
                    shift_end TEXT,
                    days TEXT
                    )
                `,)
            })
            if(err){
                console.log('Error connecting database,',err.message)
                reject(err)
            }
            else{
                console.log('Database connected successfully')
                resolve(db)
            }
        })
    })
}

export {connectDB}
