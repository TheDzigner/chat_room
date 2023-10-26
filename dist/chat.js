// Create a socket connection to the server
const socket = io.connect();


// Select HTML elements
const messageForm = document.getElementById('messageForm');
const inputMssg = messageForm.querySelector('#input_message');
const messageContainer = document.querySelector('.chats_container');
const notif = document.querySelector('.notif p');
const online = document.querySelector('.online');
const userConnected = document.querySelector('.user_connected');
const joinChatBtn = document.getElementById('joinChatBtn');
const submitMssgBtn = messageForm.querySelector('button[type="submit"]');

// Initialize variables
let newUser = '';
let newMssg = '';
let userData = {
    username: '',
    mssg: ''
};

// Function to handle joining the chat
function joinChatDialog() {
    // Display a dialog box to get the new user's name
    newUser = prompt('Who is there?!');

    if (newUser) {
        // Trim the input and sanitize it
        const sanitizednewUser = DOMPurify.sanitize(newUser.trim());

        // Check if the username is not empty and its length is less than or equal to 5 characters
        if (sanitizednewUser.length > 0 && sanitizednewUser.length <= 10) {
            removeJoinBtn();
            userData.username = sanitizednewUser;
            socket.emit('new-user', userData);
            socket.emit('user-connected');
        } else {
            alert('Please enter a username with 1 to 10 characters.');
        }
    } else {
        alert('You should enter a username to join the Room :/');
    }
}


// Event listener for the joinChatBtn
joinChatBtn.addEventListener('click', joinChatDialog);

// Function to remove the join button if there's a new user
function removeJoinBtn() {
    if (newUser.trim()) {
        joinChatBtn.style.display = 'none';
        submitMssgBtn.style.display = 'inline-block';
        inputMssg.removeAttribute('readonly');
    } else {
        joinChatBtn.style.display = 'inline-block';
        submitMssgBtn.style.display = 'none';
        inputMssg.setAttribute('readonly', 'true');
    }
}

// Call the function to initially set the join button visibility
removeJoinBtn();

// Listen for the new-user event from the socket server
socket.on('new-user', function (user) {
    notif.textContent = `${user.username} has joined the Room`;
});


socket.on('user-connected',(user) => {
    userConnected.textContent = `Connected : ${user}`
  
});


socket.on('user-disconnected',(user,connected) => {

    userConnected.textContent = `Connected : ${connected}`
    notif.textContent = `${user.username} has disconnected`;
})
// Limit the text message to 50 characters long
function checkIfMssg() {
    if (!newMssg) {
        submitMssgBtn.classList.add('disabled');
        submitMssgBtn.setAttribute('disabled', 'true');
    }
}

// Call the function to initially set the submit button
checkIfMssg();

// Event listener to check and handle the message input
inputMssg.addEventListener('input', function (e) {
    newMssg = e.target.value.trim();
    if (newMssg.length > 49) {
        submitMssgBtn.classList.add('disabled');
        submitMssgBtn.setAttribute('disabled', 'true');
        alert('50 characters long required');
    } else {
        submitMssgBtn.classList.remove('disabled');
        submitMssgBtn.removeAttribute('disabled');
        checkIfMssg();
    }
    // Emit a typing event to notify others
    socket.emit('typing', (newUser));
});

// Listen for the typing event
socket.on('typing', function (user) {
    notif.textContent = `${user} is typing...`;
});

// Event listener for message form submission
messageForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent the form from submitting
    userData.mssg = newMssg;
    socket.emit('new-message', userData);
    inputMssg.value = '';
    newMssg = '';
    checkIfMssg();
});



// Listen for new message event
socket.on('new-message', function (data) {
    // Create a new chat element with appropriate class
    const chatClass = data.username === newUser ? 'sent' : 'received';

    // Sanitize the user-generated content before inserting it
    const sanitizedMessage = DOMPurify.sanitize(data.mssg);
    const sanitizedSender = DOMPurify.sanitize(data.username)

    const chatHtml = `
    <div class="chat ${chatClass}">
        <div class="chat_header">
            <h2>${sanitizedSender === newUser ? 'Me' : sanitizedSender}</h2>
        </div>
        <div class="chat_body">
            <p>${sanitizedMessage}</p>
        </div>
    </div>
    `;
    // Append the new chat element to the chat container
    messageContainer.innerHTML += chatHtml;
    notif.innerHTML = '';
});

