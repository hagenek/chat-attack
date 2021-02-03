const socket = io();

// Elements

const $locationBtn = document.querySelector("#send-location");
const $msgFormBtn = document.querySelector("#message-form > button");
const $msgForm = document.querySelector("#message-form");
const $chatInput = document.querySelector("#input");
const $messages = document.querySelector("#messages");
const $msgTplate = document.querySelector("#msg-tplate").innerHTML;
const $locationTemplate = document.querySelector("#locationTemplate").innerHTML;

// Options

const { username, room } = qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render($msgTplate, {
    createdAt: moment(message.createdAt).format("hh:mm:ss"),
    message: message.text,
  });
  $messages.insertAdjacentHTML("beforeEnd", html);
});

socket.on("location", (loc) => {
  console.log(loc);
  const html = Mustache.render($locationTemplate, {
    url: loc.location,
    createdAt: moment(loc.createdAt).format("hh:mm:ss"),
  });
  $messages.insertAdjacentHTML("beforeEnd", html);
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

socket.emit("join", { username, room });
