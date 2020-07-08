const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
//Get username and room from URl
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();
//join chat room
socket.emit("joinRoom", { username, room });
//get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});
//Message form Server
socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);

  //SCRool Down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message Submit
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const msg = e.target.elements.msg.value;
  // EMit message to the serever
  socket.emit("chatMessage", msg);
  //CLESaR input

  e.target.elements.msg.value = "";
  e.target.elements.msg.focus = "";
});

//Outpiut message form DOM element

function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
        <p class="text"> ${message.text}
        </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

// add room name to dom
function outputRoomName(room) {
  roomName.innerText = room;
}

//users to dom
function outputUsers(users) {
  userList.innerHTML = `${users
    .map((user) => `<li>${user.username}</li>`)
    .join("")}`;
}
