<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch, watchEffect } from 'vue';
import { ApiController } from './api';

type User = {
  id: string;
  name: string;
}

type Room = {
  id: string;
  name: string;
  admin: string;
  users: string[];
}

type Message = {
  id: string;
  author: string;
  body: string;
  time: string;
}

type ErrorMessage = {
  name: boolean;
  password: boolean;
  length: boolean;
  exist: boolean;
  request: boolean;
  unknown: boolean;
}

const register = ref(false);
const isLoading = ref(false);
const errorMessage = ref<ErrorMessage>({
  name: false,
  password: false,
  length: false,
  exist: false,
  request: false,
  unknown: false,
});
const name = ref('');
const password = ref('');
const user = ref<User | null>(null);
const room = ref<Room | null>(null);
const form = ref(false);
const create = ref(false);
const message = ref('');
const editing = ref(false);
const messageObj = ref<Message | null>()
const messageArray = ref<Message[]>([]);
const usersArray = ref<User[]>([])
const box = useTemplateRef('box')
const socket = new WebSocket("ws://indigo04.github.io/chat-app");

socket.onopen = () => {
  console.log('Connected')
}

socket.onmessage = (event) => {
  const data = JSON.parse(event.data)

if (data.action === 'create') {
  messageArray.value.push(data.data)
}

if (data.action === 'remove') {
  messageArray.value = messageArray.value.filter(elem => elem.id !== data.data.id)
}

if (data.action === 'edit') {
  messageArray.value.map(elem => {
    if (elem.id === data.data.id) {
      Object.assign(elem, data.data)
    }
  })
}
}


socket.onerror = () => {
  errorMessage.value.unknown = true
}

socket.onclose = () => {
  console.log('Disconnected')
}

onUnmounted(() => {
  socket.close()
})


onMounted(() => {
  const data = localStorage.getItem('accessToken')
  if (data) {
    isLoading.value = true
    ApiController.refresh()
      .then(response => {
        user.value = response.user
        localStorage.setItem('accessToken', response.accessToken)
      })
      .finally(() => {
        isLoading.value = false
      })
  }
})

const resetError = () => {
  errorMessage.value.password = false
  errorMessage.value.name = false
  errorMessage.value.length = false
  errorMessage.value.exist = false
  errorMessage.value.request = false
}

const resetData = () => {
  if (!errorMessage.value.request && !errorMessage.value.exist) {
    name.value = ''
    password.value = ''
  }
}

const closeForm = () => {
  if (!errorMessage.value.request && !errorMessage.value.exist) {
    form.value = false;
    create.value = false;
  }
}

watch(() => name.value, async () => {
  resetError()
})

watch(() => password.value, async () => {
  resetError()
})

watch(() => room.value, async () => {
  isLoading.value = true;
  if (room.value) {
    ApiController.findUsers(room.value.users)
      .then(response => usersArray.value = response.users)
      .catch(() => errorMessage.value.unknown = true)
      .finally(() => isLoading.value = false)
  } else {
    usersArray.value = []
  }
})

watch(() => user.value, async () => {
  isLoading.value = true;
  if (user.value) {
    ApiController.searchRoom(user.value.id)
      .then(response => {
        room.value = response.data
        messageArray.value = response.messages
      })
      .catch(() => errorMessage.value.unknown = true)
      .finally(() => isLoading.value = false)
  }
})

watchEffect(async () => {
  if (box.value && messageArray.value.length) {
    nextTick(() => {
      if (box.value) {
        box.value.scrollTop = box.value.scrollHeight
      }
    })
  }
})

const Validate = async (newName: string, newPassword: string) => {
  if (!newName) {
    errorMessage.value.name = true;
  }
  if (!newPassword) {
    errorMessage.value.password = true;
  }
  if (newPassword && newPassword.length < 6) {
    errorMessage.value.length = true;
  }
  if (errorMessage.value.name || errorMessage.value.password || errorMessage.value.length) {
    return 0;
  }

  return 1;
}


const Register = async () => {
  isLoading.value = true;
  const newName = name.value;
  const newPassword = password.value;
  const validate = await Validate(newName, newPassword)
  if (validate === 0) {
    isLoading.value = false;
    return;
  }

  await ApiController.register({ name: newName, password: newPassword })
    .then(response => {
      user.value = response.user
      const accessToken = response.accessToken
      localStorage.setItem('accessToken', accessToken)
    })
    .catch(err => {
      if (err.message === 'Network Error') {
        errorMessage.value.unknown = true
      } else {
        errorMessage.value.exist = true
      }
    })
    .finally(() => {
      isLoading.value = false
      resetData()
    });
}

const Login = async () => {
  isLoading.value = true;
  const newName = name.value
  const newPassword = password.value;
  const validate = await Validate(newName, newPassword)
  if (validate === 0) {
    isLoading.value = false;
    return;
  }
  await ApiController.login({ name: newName, password: newPassword })
    .then(response => {
      user.value = response.user
      const accessToken = response.accessToken
      localStorage.setItem('accessToken', accessToken)
    })
    .catch(err => {
      if (err.message === 'Network Error') {
        errorMessage.value.unknown = true
      } else {
        errorMessage.value.request = true
      }
    })
    .finally(() => {
      isLoading.value = false
      resetData()
    });
}

const createRoom = async () => {
  isLoading.value = true;
  const newName = name.value
  const newPassword = password.value;
  const validate = await Validate(newName, newPassword)
  if (validate === 0) {
    isLoading.value = false;
    return;
  }
  const admin = user.value ? user.value.id : null;
  ApiController.createRoom({ name: newName, password: newPassword, user: admin })
    .then(response => room.value = response)
    .catch(err => {
      if (err.message === 'Network Error') {
        errorMessage.value.unknown = true
      } else {
        errorMessage.value.exist = true
      }
    })
    .finally(() => {
      isLoading.value = false
      resetData()
      closeForm()
    });
}

const joinRoom = async () => {
  isLoading.value = true;
  const newName = name.value
  const newPassword = password.value;
  const validate = await Validate(newName, newPassword)
  if (validate === 0) {
    isLoading.value = false;
    return;
  }

  const admin = user.value ? user.value.id : null;
  ApiController.joinRoom({ name: newName, password: newPassword, user: admin })
    .then(response => {
      room.value = response.room
      messageArray.value = response.messages
    })
    .catch(err => {
      if (err.message === 'Network Error') {
        errorMessage.value.unknown = true
      } else {
        errorMessage.value.request = true
      }
    })
    .finally(() => {
      isLoading.value = false
      resetData()
      closeForm()
    });
}

const removeRoom = async () => {
  isLoading.value = true;
  const roomId = room.value ? room.value.id : ''
  const userId = user.value ? user.value.id : ''
  ApiController.removeRoom({ roomId, userId })
    .catch(() => { errorMessage.value.unknown = true })
    .finally(() => {
      if (!errorMessage.value.unknown) {
        room.value = null
        message.value = ''
        messageArray.value = []
        usersArray.value = []
      }
      isLoading.value = false
    })
}

const leave = async () => {
  isLoading.value = true;
  const roomId = room.value ? room.value.id : ''
  const userId = user.value ? user.value.id : ''
  await ApiController.leave({ roomId, userId })
    .catch(() => errorMessage.value.unknown = true)
    .finally(() => {
      if (!errorMessage.value.unknown) {
        room.value = null
        message.value = ''
        messageArray.value = []
        usersArray.value = []
      }
    })
  isLoading.value = false
}

const logout = async () => {
  isLoading.value = true
  await ApiController.logout()
    .catch(() => errorMessage.value.unknown = true)
    .finally(() => {
      if (!errorMessage.value.unknown) {
        user.value = null;
        room.value = null;
        message.value = ''
        messageArray.value = []
        usersArray.value = []
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
      }
    })
  isLoading.value = false
}

const createMessage = async () => {
  isLoading.value = true;
  const roomId = room.value ? room.value.id : ''
  const author = user.value ? user.value.name : ''
  const body = message.value ? message.value : ''

  if (!body) {
    return;
  }
  ApiController.createMessage({ roomId, author, body })
    .catch(() => errorMessage.value.unknown = true)
    .finally(() => {
      message.value = ''
      isLoading.value = false
    })
}

const editForm = (elem: Message) => {
  if (editing.value === true) {
    editing.value = false
    message.value = ''
    messageObj.value = null
  } else {
    editing.value = true
    message.value = elem.body
    messageObj.value = elem
  }
}

const editMessage = async () => {
  isLoading.value = true;
  const id = messageObj.value ? messageObj.value.id : ''
  const author = user.value ? user.value.name : ''
  const body = message.value ? message.value : ''
  ApiController.editMessage(id, author, body)
    .then(response => {
      messageArray.value.map(elem => {
        if (elem.id === response.id) {
          Object.assign(elem, response)
        }
      })
    })
    .catch(() => errorMessage.value.unknown = true)
    .finally(() => {
      message.value = ''
      editing.value = false
      isLoading.value = false
    })
}

const removeMessage = async (message: Message) => {
  isLoading.value = true;
  const id = message.id
  const author = user.value ? user.value.name : ''
  ApiController.removeMessage(id, author)
    .catch(() => errorMessage.value.unknown = true)
    .finally(() => {
      if (!errorMessage.value.unknown) {
        messageArray.value = messageArray.value.filter(item => item.id !== message.id)
      }
      isLoading.value = false
    })
}

</script>

<template>
  <div class="application">
    <header class="header has-background-text has-text-primary-light is-align-items-center" v-if="user">
      <h1 class="subtitle has-text-light is-align-center m-0">Username: {{ user.name }}</h1>
      <button class="button is-dark has-background-text is-small ml-3 mt-1" :disabled="isLoading"
        @click="logout">Exit</button>
    </header>
    <div class="notification is-danger" v-if="errorMessage.unknown">
      <button class="delete" @click="errorMessage.unknown = false"></button>
      <p>Something went wrong!</p>
    </div>
    <div class="application__wrapper">
      <div class="container-max-width-400px" v-if="!user">
        <form class="box" @submit.prevent="register ? Register() : Login()">
          <h1 class="title" v-if="register">Need to register</h1>
          <h1 class="title" v-else>Need to login</h1>
          <div class="field">
            <label class="label">Username</label>
            <div class="control has-icons-left has-icons-right">
              <input class="input"
                :class="errorMessage.name || errorMessage.request || errorMessage.exist ? 'is-danger' : ''" type="text"
                placeholder="Name" v-model="name" autocomplete="username" :disabled="isLoading" name="username">
              <span class="icon is-small is-left">
                <i class="fas fa-user"></i>
              </span>
              <span class="icon is-small is-right" v-if="errorMessage.name">
                <i class="fas fa-exclamation-triangle"></i>
              </span>
            </div>
            <p class="help is-danger" v-if="errorMessage.name">Name is required</p>
            <p class="help is-danger" v-if="errorMessage.exist">Name is already taken</p>
          </div>
          <div class="field">
            <label class="label">Password</label>
            <div class="control has-icons-left has-icons-right">
              <input class="input"
                :class="errorMessage.length || errorMessage.request || errorMessage.password ? 'is-danger' : ''"
                type="password" placeholder="Password" v-model="password" autocomplete="off" :disabled="isLoading"
                name="user_password">
              <span class="icon is-small is-left">
                <i class="fas fa-lock"></i>
              </span>
              <span class="icon is-small is-right" v-if="errorMessage.name">
                <i class="fas fa-exclamation-triangle"></i>
              </span>
            </div>
            <p class="help is-danger" v-if="errorMessage.password">Password is required</p>
            <p class="help is-danger" v-if="errorMessage.length">Password is too short</p>
            <p class="help is-danger" v-if="errorMessage.request">Wrong name or password</p>
          </div>
          <div class="buttons" v-if="register">
            <button class="button is-primary" :class="isLoading ? 'is-loading' : ''" :disabled="isLoading" type="submit"
              v-if="register">Register</button>
            <button class="button is-ghost" :disabled="isLoading" type="submit" v-if="register"
              @click="() => register = false">Sign
              in</button>
          </div>
          <div class="buttons" v-else>
            <button class="button is-primary" :class="isLoading ? 'is-loading' : ''" :disabled="isLoading"
              type="submit">Sign in</button>
            <button class="button is-ghost" :disabled="isLoading" type="submit"
              @click="() => register = true">Register</button>
          </div>
        </form>
      </div>

      <div class="container" :class="room ? 'is-max-desktop' : 'is-max-tablet'" v-if="user">
        <div class="columns">
          <div class="column is-narrow" v-if="usersArray.length">
            <div class="box">
              <div class="box__wrapper">
                <table class="table is-bordered m-auto">

                  <thead>
                    <tr class="is-light">
                      <th>Id</th>
                      <th>Name</th>
                      <th>Pos</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="is-light" v-for="(user, index) of usersArray" :key="user.id">
                      <th>{{ index + 1 }}</th>
                      <th>{{ user.name }}</th>
                      <th>{{ room?.admin === user.id ? 'Admin' : 'User' }}</th>
                    </tr>
                  </tbody>

                </table>
              </div>
            </div>
          </div>
          <div class="column">
            <div v-if="!room">
              <h1 class="title">You dont have any rooms. Create one.</h1>
            </div>

            <div class="box" v-if="room">
              <h1 class="title">{{ room.name }}</h1>

              <form class="box" @submit.prevent="editing ? editMessage() : createMessage()">
                <div class="box__wrapper" ref="box">
                  <article class="message is-dark is-small" v-for="message of messageArray" :key="message.id">
                    <div class="message-header is-flex-direction-row">
                      <div class="message__wrapper">
                        <p> {{ message.author }}</p>
                        <span class="icon is-small is-right is-clickable" v-if="user.name === message.author"
                          @click="editForm(message)">
                          <i class="fas fa-pen"></i>
                        </span>
                      </div>
                      <button class="delete is-small" aria-label="delete" type="button"
                        v-if="user.name === message.author" @click="removeMessage(message)">
                      </button>


                    </div>
                    <div class="message-body">
                      <h1 class="subtitle">
                        {{ message.body }}
                      </h1>
                    </div>
                  </article>
                </div>
                <div class="field has-addons mt-5">
                  <div class="control is-expanded" :class="isLoading ? 'is-loading' : ''">
                    <input class="input" type="text" placeholder="Message" v-model="message" autocomplete="off"
                      :disabled="isLoading" name="message">
                  </div>
                  <div class="control">
                    <button class="button is-primary" :class="isLoading ? 'is-loading' : ''" type="submit"
                      :disabled="isLoading" v-if="editing">
                      Edit
                    </button>
                    <button class="button is-primary" :class="isLoading ? 'is-loading' : ''" type="submit"
                      :disabled="isLoading" v-else>
                      Send
                    </button>
                  </div>

                </div>
              </form>
            </div>

          </div>
          <div class="column is-narrow">
            <div class="buttons is-justify-content-center py-4" v-if="!room">
              <button class="button is-link" :disabled="isLoading" @click="() => { form = true; create = true }">Create
                room</button>
              <button class="button is-info" :disabled="isLoading" @click="() => { form = true; create = false }">Find
                room</button>
            </div>
            <div class="buttons is-justify-content-center py-4" v-else>
              <button class="button is-danger" :disabled="isLoading" @click="removeRoom"
                v-if="room.admin === user.id">Delete room</button>
              <button class="button is-link is-light" :disabled="isLoading" @click="leave" v-else>Leave</button>
            </div>

            <form class="box mt-6" @submit.prevent="create === true ? createRoom() : joinRoom()" v-if="form && !room">
              <h1 class="title" v-if="create">Create your room</h1>
              <h1 class="title" v-else>Find your room</h1>
              <div class="field">
                <label class="label">Name</label>
                <div class="control has-icons-left has-icons-right">
                  <input class="input"
                    :class="errorMessage.exist || errorMessage.request || errorMessage.name ? 'is-danger' : ''"
                    type="text" placeholder="Name" v-model="name" autocomplete="off" :disabled="isLoading"
                    name="room_name">
                  <span class="icon is-small is-left">
                    <i class="fa-solid fa-pen"></i>
                  </span>
                  <span class="icon is-small is-right" v-if="errorMessage.name">
                    <i class="fas fa-exclamation-triangle"></i>
                  </span>
                </div>
                <p class="help is-danger" v-if="errorMessage.name">Name is required</p>
                <p class="help is-danger" v-if="errorMessage.exist">Name is already taken</p>
              </div>
              <div class="field">
                <label class="label">Password</label>
                <div class="control has-icons-left has-icons-right">
                  <input class="input"
                    :class="errorMessage.length || errorMessage.request || errorMessage.password ? 'is-danger' : ''"
                    type="password" placeholder="Password" v-model="password" autocomplete="off" :disabled="isLoading"
                    name="room_password">
                  <span class="icon is-small is-left">
                    <i class="fas fa-lock"></i>
                  </span>
                  <span class="icon is-small is-right" v-if="errorMessage.password">
                    <i class="fas fa-exclamation-triangle"></i>
                  </span>
                </div>
                <p class="help is-danger" v-if="errorMessage.password">Password is required</p>
                <p class="help is-danger" v-if="errorMessage.length">Password is too short</p>
                <p class="help is-danger" v-if="errorMessage.request">Wrong name or password</p>
              </div>
              <button class="button is-primary" :class="isLoading ? 'is-loading' : ''" :disabled="isLoading"
                type="submit" v-if="create">Create</button>
              <button class="button is-primary" :class="isLoading ? 'is-loading' : ''" :disabled="isLoading"
                type="submit" v-else>Find</button>
              <button class="button is-link is-light ml-1" :class="isLoading ? 'is-loading' : ''" type="button"
                :disabled="isLoading"
                @click="() => { form = false; create = false; name = ''; password = ''; resetError() }">Close</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "https://cdn.jsdelivr.net/npm/bulma@1.0.2/css/bulma.min.css";

.application {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  max-height: 100%;
  overflow: hidden;
}

.application__wrapper {
  margin-top: 5%;
  box-sizing: border-box;
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header {
  width: auto;
  display: flex;
  justify-content: flex-end;
  padding-block: 15px;
  padding-inline: 45px;
}

.box__wrapper {
  max-height: 300px;
  width: 100%;
  box-sizing: border-box;
  display: block;
  overflow-y: scroll;
  scroll-behavior: smooth;
}

.message__wrapper {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
</style>
