const socket = io();

// Elements

const $locationBtn = document.querySelector("#send-location");
const $msgFormBtn = document.querySelector("#message-form > button");
const $msgForm = document.querySelector("#message-form");
const $chatInput = document.querySelector("#input");
const $messages = document.querySelector("#messages");
const msgTplate = document.querySelector("#msg-tplate").innerHTML;
const $locationTemplate = document.querySelector("#locationTemplate").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// automatic scrolling
const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight - 1 <= Math.round(scrollOffset)) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(msgTplate, {
    username: message.username,
    createdAt: moment(message.createdAt).format("hh:mm:ss"),
    message: message.text,
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("location", (loc) => {
  console.log(loc);
  const html = Mustache.render($locationTemplate, {
    username: loc.username,
    url: loc.text,
    createdAt: moment(loc.createdAt).format("hh:mm:ss"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$msgForm.onsubmit = (e) => {
  e.preventDefault();

  $msgFormBtn.setAttribute("disabled", "disabled");

  const message = e.target.elements.message.value;

  socket.emit("sendMessage", message, (error) => {
    $msgFormBtn.removeAttribute("disabled");
    $chatInput.value = "";
    $chatInput.focus();

    if (error) console.log(error);
  });
};

$locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  $locationBtn.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    console.log(position);
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $locationBtn.removeAttribute("disabled");
        console.log("Location shared!");
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
