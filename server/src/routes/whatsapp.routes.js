
import { Router } from "express";
import { whatsappService } from "../controller/whatsapp.controller.js";
import { IssueService } from "../controller/issue.controller.js";

const issueService=new IssueService()

const router=Router()

router.get('/w/groups',(req,res)=>whatsappService.getWhatsappGroups(req,res))
router.get('/w/groups/part',(req,res)=>whatsappService.getWhatsappParticipants(req,res))

router.post('/a/groups',(req,res)=>whatsappService.addGroup(req,res))
router.get('/a/groups',(req,res)=>whatsappService.getGroups(req,res))
router.delete('/a/groups',(req,res)=>whatsappService.deleteGroup(req,res))

router.get('/a/issues',(req,res)=>whatsappService.getIssues(req,res))
router.get('/a/issues',(req,res)=>whatsappService.getIssues(req,res))
router.get('/a/issues/analytics',(req,res)=>issueService.analytics(req,res))

export {router as whatsappRouter}
