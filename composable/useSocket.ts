export function useSocket() {
    const { $socket } = useNuxtApp();

    const connectSocket = () => {
        $socket.connect();
    };

    const disconnectSocket = () => {
        $socket.disconnect()
    }

   const loginUser = (user) => {
       $socket.auth = user
       connectSocket()
   } 

   const getUsers = (initialUsers: (data: any) => void ,addNewUsers:(data: any) => void) => {
        $socket.on('getUsers', data => {
            initialUsers(data)
        })

        $socket.on('userJustConnected', data => {
            addNewUsers(data)
        })
   }

   const sendMessage = (message, to) => {
       $socket.emit('privateMessage', {
           message,
           to
       })
   }

   const receiveMessageSocket = (receiveMessage: (data:any) => void) => {
       $socket.on('privateMessageToReceiver', (data) => {
            receiveMessage(data)
       })
   }

   const userDisconnect = (handleUserDisconnect: (id:string) => void) =>{
        $socket.on('userDisconnect', (id) => {
            handleUserDisconnect(id)
        })
   }

   const removeAllEventSocket = () => {
        disconnectSocket()
        $socket.removeAllListeners();
   }

    return {
        connectSocket,
        disconnectSocket,
        loginUser,
        getUsers,
        sendMessage,
        receiveMessageSocket,
        userDisconnect,
        removeAllEventSocket,
    }
}