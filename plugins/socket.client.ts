import VueSocketIO from 'vue-3-socket.io'
import SocketIO from 'socket.io-client'
export default defineNuxtPlugin((nuxtApp) => {
    const socket = SocketIO('http://localhost:4004', {
        autoConnect: false
    })
    nuxtApp.provide('socket', socket)
  })