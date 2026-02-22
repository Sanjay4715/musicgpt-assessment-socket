import http from "http";
import { Server } from "socket.io";
import { v4 } from "uuid";
import { STATUS_TYPE, versions } from "./constants/index.js";
import { generateSongTitle, getRandomItem } from "./common/index.js";

const server = http.createServer();

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://musicgpt-assessment.vercel.app/",
    ],
  },
});

// Global tasks storage
const tasks = [];

io.on("connection", (socket) => {
  console.log("Client connected");

  // Send existing tasks to new client
  socket.emit("allTasks", tasks);

  socket.on("submitPrompt", (prompt) => {
    const task = {
      id: v4(),
      status: STATUS_TYPE.CONNECTING,
      title: generateSongTitle(),
      created_at: new Date().toISOString(),
      image_custom_thumbnail:
        "https://lalals.s3.amazonaws.com/GenImages/faba14e1-ba20-4310-8ecd-3cbd9e70e58a_thumbnail.jpg",
      version_string: getRandomItem(versions),
      input_prompt: prompt,
      progress: 0,
    };

    tasks.push(task);
    console.log(`Prompt submitted: "${prompt}" -> Item ID: ${task.id}`);

    let index = 0;
    const interval = setInterval(() => {
      if (index <= 100) {
        switch (true) {
          case index === 0:
            task.status = STATUS_TYPE.CONNECTING;
            break;
          case index <= 3:
            task.status = STATUS_TYPE.STARTING;
            break;
          case index <= 19:
            task.status = STATUS_TYPE.STARTED;
            break;
          case index <= 95:
            task.status = STATUS_TYPE.GENERATING;
            break;
          case index <= 97:
            task.status = STATUS_TYPE.PENDING;
            break;
          case index <= 99:
            task.status = STATUS_TYPE.COMPLETED;
            break;
          default:
            task.status = STATUS_TYPE.SUCCESS;
        }

        task.progress = index;
        io.emit("statusUpdate", { ...task });
        console.log(
          `TaskId: ${task.id}: Progress: ${task.progress}, Status: ${task.status}`,
        );
        index++;
      } else {
        task.status = STATUS_TYPE.SUCCESS;
        io.emit("finalData", { ...task });
        console.log("Finished:", task);
        clearInterval(interval);
      }
    }, 300);
  });

  socket.on("getStatus", () => {
    socket.emit("allTasks", tasks);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

server.listen(4000, () => {
  console.log("Socket server running on http://localhost:4000");
});
