import http from "http";
import { Server } from "socket.io";
import { v4 } from "uuid";
import { files, STATUS_TYPE, thumbnails, versions } from "./constants/index.js";
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

  socket.on("submitPrompt", ({ prompt, id }) => {
    const taskId = id ? id : v4();
    const activeTasks = tasks.filter((t) => t.status !== STATUS_TYPE.SUCCESS);

    console.log("activeTasks", activeTasks.length, activeTasks);

    if (activeTasks.length >= 5) {
      console.log(
        "Server is busy. Please wait until one of the tasks completes.",
      );
      socket.emit("serverBusy", {
        id: taskId,
        prompt,
        created_at: new Date().toISOString(),
        status: STATUS_TYPE.FAILED,
        error_tag: "SERVER_BUSY",
        error_message: "Oops! Server busy",
        error_message_detail:
          "Many task or users on queue. Please wait for a moment until a task is complete",
      });
      return;
    }

    const task = {
      id: taskId,
      status: STATUS_TYPE.CONNECTING,
      title: generateSongTitle(),
      created_at: new Date().toISOString(),
      image_custom_thumbnail: getRandomItem(thumbnails),
      version_string: getRandomItem(versions),
      input_prompt: prompt,
      progress: 0,
    };

    tasks.push(task);
    console.log(`Prompt submitted: "${prompt}" -> Item ID: ${taskId}`);

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
        const {
          file_output_0,
          lyrics,
          lyrics_output_timestamped,
          audio_length_ms,
        } = getRandomItem(files);
        io.emit("finalData", {
          ...task,
          file_output_0,
          lyrics,
          lyrics_output_timestamped,
          audio_length_ms,
        });
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
