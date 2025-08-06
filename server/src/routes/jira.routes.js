
import { Router } from "express";
import { jiraService } from "../controller/jira.controller.js";

const router=Router()

router.get('/',(req,res)=>jiraService.getUsers(req,res))
router.post('/assignee',(req,res)=>jiraService.addAssignee(req,res))
router.get('/assignee',(req,res)=>jiraService.getAssignees(req,res))
router.delete('/assignee/:id',(req,res)=>jiraService.removeAssignee(req,res))

export {router as jiraRouter}
