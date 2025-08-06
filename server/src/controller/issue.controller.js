import {db} from '../index.js'
import { v4 as uuidv4 } from 'uuid';
import { jiraService } from './jira.controller.js';

export class IssueService{

  async analytics(req,res){
    db.all(`select
        (select count(*) from issues) as totalIssues,
        (select count(*) from issues where priority=?) as criticalIssues,
        (select count(*) from issues where status='open') as openIssues,
        (select count(*) from issues where status!='open') as resolvedIssues,
        (select AVG((resolved_at-created_at)/1000.0) from issues where resolved_at is not null) as avgResolution;
      `,['critical'],(err,rows)=>{
        if(err){
          res.status(401).json({
            data:null, message: 'Database error' + err?.message
          })
        }
        else{
          res.status(200).json({
            data:rows[0], message: 'Analytics fetched successfully'
          })
        }
      })
  }

  async createIssueFromMessage(message,title,description){
    
    let issue = {
      id: uuidv4(),
      title,
      description,
      status: 'open',
      priority: 'High',
      assignee: null,
      whatsapp_group_id: message.groupId,
      reporter_id: message?.senderId,
      team_name: message?.groupName,
      created_at: new Date(),
      updated_at: new Date()
    };

    try{
      issue.assignee=await this.getCurrentAssignee()
      issue.id=await jiraService.createTicket(issue)
      await this.storeIssue(issue);
      return issue?.id
    }
    catch(err){
      console.log(`Error creating issue in database: ${err?.message}`)
    }
    
  }

  async getCurrentAssignee(){

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDayName=daysOfWeek[(new Date()).getDay()]
    let assignee=null

    return new Promise( (resolve,reject)=> {

      db.all(`
        select a.assignee,b.shift_start,b.shift_end,b.days from 
        (select assignee,cnt from 
        (select i.assignee as assignee,count(*) as cnt from issues i group by assignee)
        t)
        a inner join assignees b on a.assignee=b.id order by a.cnt asc
        `,(err,rows)=>{
        if(err){
          reject(err)
        }
        else{
          const assigned=rows
          ?.filter(row=>this.isCurrentTimeInRange(row?.shift_start,row?.shift_end))
          ?.filter(row=>JSON.stringify(row?.days)?.includes(currentDayName))
          ?.map(value=>value?.assignee);

          db.all(` select id as assignee,shift_start,shift_end,days from assignees `,async(err,rows)=>{
            if(err){
              reject(err)
            }
            else{
              const unassigned=rows
              ?.filter(unassignedValue=>!assigned.find(assignedValue=>unassignedValue?.assignee==assignedValue))
              ?.filter(unassignedValue=>JSON.stringify(unassignedValue?.days)?.includes(currentDayName))
              ?.filter(unassignedValue=>this.isCurrentTimeInRange(unassignedValue?.shift_start,unassignedValue?.shift_end))
              ?.map(unassignedValue=>unassignedValue?.assignee)

              if(unassigned.length>0) assignee=unassigned[0]
              else assignee=assigned.length>0?assigned[0]:null

              resolve(assignee);
            }
          })
        }
      })

    })
  }

  async storeIssue(issue) {
    const sql = `
      INSERT INTO issues 
      (id,
      title,
      description,
      status,
      priority,
      assignee,
      whatsapp_group_id,
      reporter_id,
      team_name,
      created_at,
      updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.run(sql, [
      issue.id,
      issue.title,
      issue.description,
      issue.status,
      issue.priority,
      issue.assignee,
      issue.whatsapp_group_id,
      issue.reporter_id,
      issue.team_name,
      issue.created_at,
      issue.updated_at
    ],(err)=>{
      if(err){
        console.log('Error while sotring issue in database:',err?.message)
      }
    });
  }

  isCurrentTimeInRange(startTime, endTime) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (startMinutes <= endMinutes) {
      // Normal case (e.g., 09:00 to 17:30)
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
      // Overnight shift (e.g., 22:00 to 06:00)
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
  }

}
