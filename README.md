# MusicGPT Socket Server

This is a standalone **Socket.IO server** for MusicGPT that handles live generation tasks and progress updates. It is implemented in **Node.js** using ES modules and runs on port `4000` by default.

---

## 🛠 Features

- Accepts prompts from clients via WebSocket (`submitPrompt`)
- Tracks task status and progress (`CONNECTING`, `STARTING`, `GENERATING`, `COMPLETED`, etc.)
- Broadcasts updates to all connected clients (`statusUpdate`, `finalData`)
- Stores tasks in memory (global storage) so new clients receive existing tasks (`allTasks`)
- Compatible with frontend Next.js application running on `localhost:3000` or deployed URL

---

## ⚡ Requirements

- **Node.js** version: `22.14.0`
- **npm** (comes with Node.js)
- No additional global dependencies needed

---

## 🚀 Installation

1. Clone the repository:

   ```bash
       git clone https://github.com/Sanjay4715/musicgpt-assessment-socket
       cd musicpgt-assessment-socket
   ```

2. Install dependencies
   ```bash
   npm install
   ```
3. Running the Server Start the Socket.IO server with:
   `bash
npm run start
`
   The server will run on http://localhost:4000

Make sure your frontend (Next.js) is running on http://localhost:3000
or your deployed URL

The server supports CORS for:

```bash
http://localhost:3000
https://musicgpt-assessment.vercel.app/
```

## 🔌 Socket Events

### From Client

- **submitPrompt** – Send a prompt to create a new task

```js
socket.emit("submitPrompt", "My prompt text");
```

-**getStatus** – Request all current tasks

```js
socket.emit("getStatus");
```

### From Server

- **allTasks** – Sends the list of all tasks
- **statusUpdate** – Sends updates for task progress
- **finalData** – Sends task data when generation completes
