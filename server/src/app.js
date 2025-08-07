
import express from "express"
import { whatsappService } from "./controller/whatsapp.controller.js"

const app=express()

app.use(express.json({
    limit: '16kb'
}))

app.use(express.urlencoded({
    extended: true,
    limit: '16kb'
}))

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  whatsappService.addConnection(res)

  res.write(`data: ${JSON.stringify({ type: 'online' })}\n\n`);

  req.on('close', () => {
    res.write(`data: ${JSON.stringify({ type: 'offline' })}\n\n`);
  });

});

import { whatsappRouter } from "./routes/whatsapp.routes.js"
import { jiraRouter } from "./routes/jira.routes.js"

app.use('/api',whatsappRouter)
app.use('/api/j',jiraRouter)

export {app}
