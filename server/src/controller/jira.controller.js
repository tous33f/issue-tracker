
import {db} from '../index.js'
import https from 'https'
import axios from 'axios'
import { whatsappService } from './whatsapp.controller.js'
import { v4 as uuid } from 'uuid'
import { PassThrough } from 'stream'

export class JiraService{

    constructor(){
        this.token=''
        this.project='VA'
        this.jiraUrl=''
        this.agent=new https.Agent({
            rejectUnauthorized: false
        })
        this.cnt=0
        this.shouldRun=false
        this.timeout=10000
    }

    async getUsers(req,res){
        let response
        try{
            response=await axios.get(`${this.jiraUrl}/rest/api/2/user/search?username='&maxResults=1000`,{
                headers: {
                    ...this.getHeaders()
                },
                httpsAgent: this.agent
            });
        }
        catch(err){
            console.log(err?.message)
            return res.status(500).json({
                data: null,
                message: "Fetch failed while connecting to Jira server"
            });
        }
        const data=response?.data?.map(i=>{
            return {
                id: i?.name,
                name: i?.displayName
            }
        })
        res.status(201).json({
            data,
            message: "Jira users fetched successfully"
        })
    }

    getHeaders(){
        return {
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Atlassian-Token': 'no-check',
            'User-Agent': 'PostmanRuntime/7.44.1'
        };
    }

    async addAssignee(req,res){
        const {id,name,shift_start,shift_end,days}=req?.body;
        if(!id || !name || !shift_start || !shift_end || !days || !Array.isArray(days)){
            res.status(401).json({
                data: null,message: "Request body is incorrect"
            })
            return;
        }
        db.run(` INSERT INTO assignees(id,name,shift_start,shift_end,days) values(?,?,?,?,?) `,[id,name,shift_start,shift_end,JSON.stringify(days)],(err)=>{
            if(err){
                res.status(401).json({
                    data: null, message: `Error storing assignee in database: ${err?.message}`
                })
                return
            }
            else{
                res.status(201).json({
                    data: null, message: "Assignee added successfully"
                })
            }
        })
    }

    async getAssignees(req,res){
        db.all(`select * from assignees`,(err,rows)=>{
            if(err){
                res.status(401).json({
                    data: null, message: `Error getting assignee info from database: ${err?.message}`
                })
                return
            }
            else{
                const data=rows?.map(row=>{
                    return {
                        ...row,days: JSON.parse(row?.days)
                    }
                })
                res.status(201).json({
                    data: data, message: "Assignees fetched successfully"
                })
            }
        })
    }

    async removeAssignee(req,res){
        const {id}=req?.params;
        if(!id){
            res.status(401).json({
                data: null, message: "ID is not given"
            })
            return
        }
        db.all(`select * from assignees where id=?`,[id],(err,rows)=>{
            if(err){
                res.status(401).json({
                    data: null, message: `Error fetching assignee from database: ${err?.message}`
                })
                return;
            }
            db.run(`delete from assignees where id=?`,[id],err=>{
                if(err){
                    res.status(401).json({
                        data: null, message: `Error removing assignee from database: ${err?.message}`
                    })
                    return
                }
                else{
                    res.status(201).json({
                        data: null, message: "Assignee removed successfully"
                    })
                    return
                }
            })
        })
    }

    async createTicket(title,description,assignee){
        const keys=['VA-413','VA-397','VA-427','VA-414','VA-400','VA-391','VA-373','VA-374','VA-376','VA-430','VA-365']
        let issueData = {
            fields: {
                project: {
                    key: 'VA'
                },
                summary: title,
                description: description,
                issuetype: {
                    name: 'Task'
                },
                priority: {
                    name: 'Highest'
                },
                assignee:{
                    name: assignee
                }
            }
        };
        return new Promise((resolve,reject)=>{
            resolve(keys[this.cnt++])
        })
    }

    async updateIssuesById(){
        return new Promise((resolve,reject)=>{
            db.all(`select jira_id as id from issues where status='open';`,(err,rows)=>{
                if(err){
                    reject(err)
                }
                const open_issues=rows?.map(row=>row?.id)
                if(Array.isArray(open_issues) && open_issues.length<1){
                    resolve()
                    return;
                }
                // resolve()
                // return;
                axios.get(`${this.jiraUrl}/rest/api/2/search?jql=issuekey+IN+( ${open_issues?.join(',') || ''} )+AND+statusCategory="Done"&fields=status`,{
                    headers: {
                        ...this.getHeaders()
                    },
                    httpsAgent: this.agent
                })
                .then(res=>{
                    const closed_issues=res?.data?.issues?.filter(issue=>open_issues?.includes(issue?.key))?.map(issue=>issue?.key)
                    if(Array.isArray(closed_issues) && closed_issues.length<1){
                        resolve()
                        return;
                    }
                    db.run(`update issues set status='closed',resolved_at=? where id IN (${closed_issues?.map(item => `"${item}"`)?.join(',') || ''})`,[(new Date())],async(err)=>{
                        if(err){
                            reject(err)
                        }
                        else{
                            await this.sendUpdateMessage(closed_issues)
                            resolve()
                        }
                    })
                })
                .catch(err=>{
                    console.log(err?.message)
                    reject(err)
                })
            })
        })
    }

    async syncComments(){
        return new Promise((resolve,reject)=>{
            db.all(`select jira_id as id,comments,whatsapp_group_id,reporter_id from issues where status='open' `,(err,rows)=>{
                if(err){
                    reject(err)
                    return;
                }
                else{
                    const open_issues=rows?.map(row=>row?.id)
                    if(Array.isArray(open_issues) && open_issues.length<1){
                        resolve()
                        return;
                    }
                    axios.get(`${this.jiraUrl}/rest/api/2/search?jql=issuekey+IN+( ${open_issues?.join(',') || ''} )&fields=comment`,{
                        headers: {
                            ...this.getHeaders()
                        },
                        httpsAgent: this.agent
                    })
                    .then((res)=>{
                        const data=res.data.issues?.map(issue=>{
                            return {
                                id: issue?.key,
                                comments: issue?.fields?.comment?.comments?.map(comm=>{
                                    return {
                                        id: comm?.id,
                                        name:comm?.author?.name,
                                        body: comm?.body
                                    }
                                })
                            }
                        })
                        // console.log(data)
                        rows?.forEach(async (row)=>{
                            const db_comments=new Set( (row?.comments?.split(',')) || [] );
                            const jira_comments=new Set( (data?.find(issue=>issue?.id==row?.id)?.comments?.map(v=>v.id)) || [] )
                            const new_comments=jira_comments.difference(db_comments)
                            // console.log(db_comments,jira_comments,new_comments)
                            new_comments.forEach(async (id)=>{
                                const comment=data?.find(v=>v?.id==row?.id)?.comments?.find(v=>v?.id==id)
                                await whatsappService.sendIssueCommentMessage(row?.whatsapp_group_id,row?.reporter_id,row?.id,comment?.name,comment?.body)
                            })
                            const updated_comments=Array.from(jira_comments).join(',')
                            await this.updateIssueComments(updated_comments,row?.id)
                        })
                        resolve()
                    })
                    .catch(err=>{
                        console.log(err?.message)
                        reject(err)
                    })
                }
            })
        })
    }

    async updateIssueComments(updated_comments,jira_id){
        return new Promise((resolve,reject)=>{
            db.run(`update issues set comments=? where jira_id=?`,[updated_comments,jira_id],err=>{
                if(err){
                    reject(err)
                }
                else{
                    resolve()
                }
            })
        })
    }

    async sendUpdateMessage(closed_issues){
        return new Promise((resolve,reject)=>{
            db.all(`select id,whatsapp_group_id,reporter_id from issues where id IN (${closed_issues?.map(item => `"${item}"`)?.join(',') || ''})`,(err,rows)=>{
                if(err){
                    reject(err)
                }
                else{
                    rows?.forEach(async (row) => {
                        await whatsappService.sendIssueCloseMessage(row?.whatsapp_group_id,row?.reporter_id,row?.id)
                    });
                    resolve()
                }
            })
        })
    }

    async uploadAttachment(issueKey,base64Str,filename){
        if(!filename){
            filename=uuid()
        }
        console.log(filename)
        const binaryData=Buffer.from(base64Str,'base64')
        const stream=new PassThrough()
        stream.end(binaryData)
        const form=new FormData()
        form.append('file',stream)
        stream.destroy()
        console.log(form)
    }

    async runPolling(){
        if(!this.shouldRun) return;
        try{
            if(whatsappService.isClientReady()){
                await this.updateIssuesById()
                await this.syncComments()
            }
        }
        catch(err){
            console.log(`Error in JIRA polling: ${err?.message}`)
        }
        whatsappService.sendToAllClients({type: 'issue'})
        setTimeout(()=>this.runPolling(),this.timeout)
    }

    async subscribe(){
        this.shouldRun=true;
        console.log('Polling started for JIRA!')
        this.runPolling()
    }

    unsubscribe(){
        if(this.shouldRun){
            this.shouldRun=false
            console.log('Polling stopped for JIRA!')
        }
    }

}

let jiraService=new JiraService()

export {jiraService}
