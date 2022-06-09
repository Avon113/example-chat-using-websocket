<template>
  <div>
    <div class='header'>
      <h1>Test WebSocket</h1>
      <div class=field-name>
          <p>Your name:</p>
          <input type="text" v-model="userName" />
      </div>
      <h3>List user online:</h3>
      <ul class="list-chat-user">
        <li
          :class="[
            'chat-user',
            { selected: user?.userId === selectedUser?.userId, self: user.self },
          ]"
          v-for="(user,index) in users"
          :key='index'
          @click="handleSelected(user)"
        >
          {{ user.username }}
        </li>
      </ul>
      <button @click="handleConnectSocket">Connect Socket</button>
    </div>
    <!--  chat box -->
    <div v-if='selectedUser'>
      <div class='chat-box'>
          <div :class="['container', {right: message.fromMe}]" v-for='(message, index) in listMessage[selectedUser.userId]' :key=index>
              <div class="avatar-image"></div>
              <p>{{ message.text }}</p>
              <span class="time-right"></span>
          </div>
      </div>
    

      <div>
        <input type='text' @keyup.enter='handleSendMessage' class='text-chat' v-model='message'/>
        <button class='btn' @click='handleSendMessage'>Send Message</button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useSocket } from "../composable/useSocket";

const { $socket } = useNuxtApp();

const { connectSocket, 
        loginUser, 
        getUsers, 
        sendMessage, 
        receiveMessageSocket, 
        userDisconnect, 
        removeAllEventSocket } = useSocket();
const userName = ref("");
const users = ref([]);
const handleConnectSocket = () => {
  loginUser({ username: userName.value });
  console.log('login success')
};

const initialUsers = (data) => {
  data.forEach((user) => {
    user.self = $socket.id === user.userId
    user.message = {}
    users.value.push(user);
  });

  users.value.sort((a, b) => {
    if (a.self) return -1;
    if (b.self) return 1;
    if (a.username < b.username) return -1;
    return a.username > b.username ? 1 : 0;
  });
};

const updateUsers = (data) => {
  console.log("new user just joinning", data);
  users.value.push(data);
};

const handleUserDisconnect = (id) => {
  console.log(users.value);
  
  users.value = users.value.filter(user => user.userId !== id)
}


// send message and receive
const selectedUser = ref();
const message = ref('')
const listMessage = reactive({})

const handleSelected = (user) => {
  selectedUser.value = user;
  console.log(selectedUser.value);
};

const handleSendMessage = () => {
  const to = selectedUser.value.userId
  if(!listMessage[to]) listMessage[to] = []
  sendMessage(message.value, to)
  listMessage[to].push({ fromMe: true, text: message.value })
  message.value = ''
}

const receiveMessage = ({message, from}) => {
  if(!listMessage[from]) listMessage[from] = []
  listMessage[from].push({ fromMe: false, text:message})
  console.log(listMessage);
}

onMounted(() => {
  getUsers(initialUsers, updateUsers)
  receiveMessageSocket(receiveMessage)
  userDisconnect(handleUserDisconnect)
});

onUnmounted(() => {
  removeAllEventSocket()
})

watch(listMessage, (cur) => {
  console.log(cur);
}, {deep: true})
</script>
<style>
.header {
  margin-bottom: 8px;
}


.list-chat-user {
  list-style: none;
}

.chat-user {
  width: 200px;
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 4px;
  background: #999;
}

.selected {
  background: black;
  color: white;
}

.self {
  background: green;
}

.chat-box {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
}

.container {
  border: 2px solid #dedede;
  background-color: #f1f1f1;
  border-radius: 5px;
  padding: 10px;
  margin: 10px 0;
}

/* Darker chat container */
.darker {
  border-color: #ccc;
  background-color: #ddd;
}

/* Clear floats */
.container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

/* Style images */
.container .avatar-image {
  background: #666;
  width: 60px;
  height: 60px;
  margin: 0 20px;
  border-radius: 50%;
}

/* Style the right image */
.container.right {
   flex-direction: row-reverse;
}

.text-chat {
  margin-bottom: 16px;
  padding: 8px;
  width: 100%;
  max-width: 100%;
  outline: none;
}

.btn {
  padding: 8px;
}
</style>
