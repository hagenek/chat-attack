const socket = io();

socket.on("message", (message) => {
  console.log(message);
});

const msgForm = document.querySelector("#message-form");

msgForm.onsubmit = (e) => {
  e.preventDefault();

  const message = e.target.elements.message.value;

  socket.emit("sendMessage", message);
};

const locationBtn = document.querySelector("#send-location");

locationBtn.onclick = () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit("sendLocation", {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
  });
};
