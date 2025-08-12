
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

router.get('/a/issues',(req,res)=>issueService.getIssues(req,res))
router.get('/a/issues/analytics',(req,res)=>issueService.analytics(req,res))
router.get('/a/assignee/analytics',(req,res)=>issueService.assigneeReport(req,res))

router.get('/w/connection',(req,res)=>{
    res.status(201).json({
        data: whatsappService.isClientReady(),
        message: 'Whatsapp client status fetched successfully'
    })
})
router.get('/w/qr',(req,res)=>{
    res.status(201).json({
        data: whatsappService.qr,
        message: 'Whatsapp qr fetched successfully'
    })
})
router.get('/w/logout',async (req,res)=>{
    await whatsappService.logout()
    res.status(201).json({
        data: null,
        message: 'Whatsapp client logged out successfully'
    })
})

export {router as whatsappRouter}
