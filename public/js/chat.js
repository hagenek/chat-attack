const socket = io()

// Elements

const $locationBtn = document.querySelector("#send-location");
const $msgFormBtn = document.querySelector("#message-form > button");
const $msgForm = document.querySelector("#message-form")
const $chatInput = document.querySelector("#input")
const $messages = document.querySelector("#messages")
const $msgTplate = document.querySelector("#msg-tplate").innerHTML

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render($msgTplate, {message})
  $messages.insertAdjacentHTML('beforeEnd', html)
});


$msgForm.onsubmit = (e) => {

  e.preventDefault();

  $msgFormBtn.setAttribute('disabled', 'disabled')

  const message = e.target.elements.message.value;

  socket.emit("sendMessage", message, (error) => {

    $msgFormBtn.removeAttribute('disabled')
    $chatInput.value = ""
    $chatInput.focus()

    if (error) console.log(error)
  })
};


$locationBtn.onclick = () => {

  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  navigator.geolocation.getCurrentPosition((position) => {
    console.log(position);
    socket.emit("sendLocation", {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    }, (serverMessage) => console.log(serverMessage));
  });
};
