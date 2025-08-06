import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg
import qrcode from 'qrcode-terminal';
import { IssueService } from './issue.controller.js';
import { db } from '../index.js';

let connections=[]

class WhatsAppService {
  constructor() {
    this.client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true,
            args: [
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-accelerated-2d-canvas',
            '--no-zygote',
            '--disable-infobars'
            ]
        }
    });

    this.issueService = new IssueService();
    this.isReady = false;

    this.initializeClient();
  }

    sendToAllClients(data){
        connections.forEach((res) => {
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        });
    }

    addConnection(res){
        connections.push(res)
    }

  initializeClient() {
    this.client.on('qr', (qr) => {
      console.log('Scan this QR code with WhatsApp:');
      qrcode.generate(qr, { small: true });
    });

    this.client.on('ready', () => {
      console.log('WhatsApp client is ready!');
      this.isReady = true;
    });

    this.client.on('message', async (message) => {
        await this.handleMessage(message);
    });

    this.client.on('disconnected', (reason) => {
      console.log('WhatsApp client disconnected:', reason);
      this.isReady = false;
    });
  }

  async start() {
    try {
      await this.client.initialize();
    } catch (error) {
      console.error('Error starting WhatsApp client:', error);
      throw error;
    }
  }

  async handleMessage(message){
    if(!message.from.endsWith('@g.us')){
        return;
    }
    const contact=await message.getContact()
    const chat=await message.getChat()

    db.all(`select group_id from groups`,async(err,rows)=>{
        if(err){
            console.log(err.message)
            return;
        }
        const groups=rows.map(row=>row?.group_id)
        if(!groups.includes(chat?.id?._serialized)){
            return;
        }
        const extractedIssue =await this.processMessageForIssues({
            message: message?.body,
            groupId: chat?.id?._serialized,
            groupName: chat?.name,
            senderId: contact?.id?._serialized,
            senderName: contact?.name || contact?.pushname || 'Unknown',
            senderNumber: contact?.number,
            senderId: contact?.id?._serialized,
            timestamp: new Date(message.timestamp * 1000),
        });

        if(extractedIssue){
          await this.sendConfirmation(chat?.id?._serialized,contact?.id?._serialized,extractedIssue)
          this.sendToAllClients({message: 'get'})
        }
    })

  }

  async sendConfirmation(chatId,senderId, issueId) {
    if (!this.isReady) return;

    const contact=await this.client.getContactById(senderId)
    
    const confirmationMessage = `*Issue Created Successfully*\n\n📋Issue ID: *${issueId}*\n\n@${contact.number}\nYour issues have been logged and assigned to the relevant team members. You'll receive updates as they are processed.\n\n`;

    try {
      await this.client.sendMessage(chatId, confirmationMessage,{mentions: [contact]});
    } catch (error) {
      console.error('Error sending confirmation message:', error);
    }
  }

  async sendIssueCloseMessage(chatId,senderId, issueId) {
    if (!this.isReady) return;

    const contact=await this.client.getContactById(senderId)
    
    const confirmationMessage = `*Issue Closed Successfully*\n\n📋Issue ID: *${issueId}*\n\n@${contact.number}\nYour logged issue has been successfully resolved by the Operations team. You will not any receive updates related to the issue.\n\n`;

    try {
      await this.client.sendMessage(chatId, confirmationMessage,{mentions: [contact]});
    } catch (error) {
      console.error('Error sending confirmation message:', error);
    }
  }

  async processMessageForIssues(message){

    const regex = /^\[(\w+)\]\s*(.+)\n([\s\S]+)/;
    const match = message.message.match(regex);

    if (!match || match?.length<3) {
      return null;
    }

    const tag = match[1];
    if(tag && tag?.toLowerCase()!='issue'){
      return null;
    }
    const title = match[2];
    const description = match[3];

    const issueId = await this.issueService.createIssueFromMessage(message, title, description );
    return issueId;
  }

  async getWhatsappGroups(req,res){
    const chats=await this.client.getChats();
    const filtered=chats.filter(chat=>chat.isGroup)
    const groups=filtered.map(chat=>{
        return {
            id: chat.id._serialized,
            name: chat.name,
            description: chat.description || ''
        }
    })
    res.status(200).json({data: groups})
  }

  async getWhatsappParticipants(req,res){
    const groupId=req.query?.groupId
    if(!groupId){
        res.json({data:null,message:"Id is not given"})
        return
    }
    const group=await this.client.getChatById(groupId)
    if(!group){
        res.json({data:null,message:"Id is invalid"})
        return
    }
    const members=[]
    for (const participant of group?.participants){
        const contact = await this.client.getContactById(participant.id._serialized);
        // if(contact?.isMe) continue
        members.push({
            id: contact.id._serialized,
            name:  contact.name || contact.pushname || 'N/A' ,
            number: contact.number
        })
    }
    res.status(200).json({data: members})
  }

  async getGroups(req, res) {
        db.all(`SELECT * FROM groups`,async (err,rows)=>{
            if(err){
                res.status(401).json({
                    data: null, message: 'Database error' + err?.message
                })
            }
            else{
                let data=[]
                for(const row of rows){
                    let teamLead=null
                    if(row?.team_lead){
                        teamLead=await this.client.getContactById(row?.team_lead)
                    }
                    data.push({
                        id: row?.group_id,
                        name: row?.group_name,
                        description: row?.group_description,
                        teamLead: teamLead?.name || teamLead?.pushname || 'Unknown'
                    })
                }
                res.status(200).json({ data });
            }
        });
    }

    async getIssues(req,res){
        db.all(`SELECT * FROM issues`,(err,data)=>{
            if(err){
                res.status(401).json({
                    data: null, message: 'Database error' + err?.message
                })
            }
            else{
                res.status(200).json({ data });
            }
        })
    }

    async deleteGroup(req,res){
        const {groupId}=req.query
        console.log(groupId)
        db.run(`DELETE FROM groups where group_id=?`,[groupId],(err)=>{
            if(err){
                res.status(401).json({
                    data: null, message: `Database error`
                })
            }
            else{
                res.status(200).json({
                    data: null, message: `Group deleted successfully`
                })
            }
        })
    }


  async addGroup(req,res){
    try{
        const {id,name,description}=req.body
        db.run(`
        INSERT INTO groups (group_id,group_name,group_description) VALUES (?,?,?)
        `,[id,name,description],)
        res.status(200).json({
            data: null, message: 'Group addedd successfully'
        })
    }
    catch(err){
        res.status(401).json({
            data: null,message: err?.message
        })
    }
  }

  isClientReady() {
    return this.isReady;
  }

  async stop() {
    await this.client.destroy();
  }
}

let whatsappService=new WhatsAppService()

export {whatsappService,connections}