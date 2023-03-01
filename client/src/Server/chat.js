class Chat {
    constructor() {

        //our username 
        this.name = null; 
        this.connectedUser= null;
        
        //connecting to our signaling server 
        this.conn = new WebSocket('ws://localhost:3002');
        
        this.conn.onopen = function () { 
            console.log("Connected to the signaling server"); 
        };
        
        const chatMachine = this
        //when we got a message from a signaling server 
        this.conn.onmessage = function (msg) { 
            console.log("Got message", msg.data); 
            var data = JSON.parse(msg.data); 
                
            switch(data.type) { 
                case "login": 
                chatMachine.handleLogin(data.success); 
                    break; 
                //when somebody wants to call us 
                case "offer": 
                chatMachine.handleOffer(data.offer, data.name); 
                    break; 
                case "answer": 
                chatMachine.handleAnswer(data.answer); 
                    break; 
                //when a remote peer sends an ice candidate to us 
                case "candidate": 
                chatMachine.handleCandidate(data.candidate); 
                    break; 
                case "leave": 
                chatMachine.handleLeave(); 
                    break; 
                default: 
                    break; 
            } 
        }; 

        this.conn.onerror = function (err) { 
            console.log("Got error", err); 
        };

    
        //****** 
        //UI selectors block 
        //****** 

        this.loginPage = document.getElementById('loginPage'); 
        this.usernameInput = document.getElementById('usernameInput'); 
        this.loginBtn = document.getElementById('loginBtn');

        this.callPage = document.getElementById('callPage'); 
        this.callToUsernameInput = document.getElementById('callToUsernameInput');
        this.callBtn = document.getElementById('callBtn'); 

        this.hangUpBtn = document.getElementById('hangUpBtn'); 
        this.localAudio = document.getElementById('localAudio'); 
        this.remoteAudio = document.getElementById('remoteAudio'); 

        this.yourConn = null; 
        this.stream = null; 

        this.callPage.style.display = "none";
        
        // Login when the user clicks the button 
        this.loginBtn.addEventListener("click", function (event) { 
            chatMachine.name = chatMachine.usernameInput.value; 
            if (chatMachine.name.length > 0) { 
                chatMachine.send({ 
                    type: "login", 
                    name: chatMachine.name 
                }); 
            } 
            
        }.bind(this));
 
        //initiating a call 
        this.callBtn.addEventListener("click", function () { 
            var callToUsername = chatMachine.callToUsernameInput.value; 
                
            if (callToUsername.length > 0) { 
                chatMachine.connectedUser = callToUsername; 
                    
                // create an offer 
                chatMachine.yourConn.createOffer(function (offer) { 
                    chatMachine.send({
                        type: "offer", 
                        offer: offer 
                    }); 
                        
                    chatMachine.yourConn.setLocalDescription(offer); 
                }, function (error) { 
                    alert("Error when creating an offer"); 
                }); 
            } 
            }.bind(this));

        //hang up
        this.hangUpBtn.addEventListener("click", function () { 
            chatMachine.send({ 
                type: "leave" 
            }); 
                
            chatMachine.handleLeave(); 
        }.bind(this));

    }


    //alias for sending JSON encoded messages 
    send(message) { 
        //attach the other peer username to our messages 
        if (this.connectedUser) { 
            message.name = this.connectedUser; 
        } 
            
        this.conn.send(JSON.stringify(message)); 
    };
    
    handleLogin(success) { 
    if (success === false) { 
        alert("Ooops...try a different username"); 
    } else { 
            
        //********************** 
        //Starting a peer connection 
        //********************** 
        
        const chatMachine = this 
        chatMachine.loginPage.style.display = "none"; 
        chatMachine.callPage.style.display = "block"; 
        //getting local audio stream 
        navigator.webkitGetUserMedia({ video: false, audio: true }, function (myStream) { 
            chatMachine.stream = myStream; 
            
            //displaying local audio stream on the page 
            chatMachine.localAudio.srcObject = chatMachine.stream;
                
            //using Google public stun server 
            var configuration = { 
                "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }] 
            }; 
                
            chatMachine.yourConn = new RTCPeerConnection(configuration); 
                
            // setup stream listening 
            chatMachine.yourConn.addStream(chatMachine.stream); 
                
            //when a remote user adds stream to the peer connection, we display it 
            chatMachine.yourConn.onaddstream = function (e) { 
                chatMachine.remoteAudio.srcObject = e.stream; 
            }; 
                
            // Setup ice handling 
            chatMachine.yourConn.onicecandidate = function (event) { 
                if (event.candidate) { 
                    chatMachine.send({ 
                    type: "candidate", 
                    candidate: event.candidate 
                }); 
                } 
            }; 
                
        }, function (error) { 
            console.log(error); 
        }); 
            
    } 
    };
    
    
    //when somebody sends us an offer 
    handleOffer(offer, name) { 
        this.connectedUser = name; 
        this.yourConn.setRemoteDescription(new RTCSessionDescription(offer)); 
            
        const chatMachine = this 
        //create an answer to an offer 
        this.yourConn.createAnswer(function (answer) { 
            chatMachine.yourConn.setLocalDescription(answer); 
                
            chatMachine.send({ 
                type: "answer", 
                answer: answer 
            });
                
        }, function (error) { 
            alert("Error when creating an answer"); 
        }); 
        
    };
    
    //when we got an answer from a remote user 
    handleAnswer(answer) { 
        this.yourConn.setRemoteDescription(new RTCSessionDescription(answer)); 
    };
    
    //when we got an ice candidate from a remote user 
    handleCandidate(candidate) { 
        this.yourConn.addIceCandidate(new RTCIceCandidate(candidate)); 
    };
    
    
    handleLeave() { 
        this.connectedUser = null; 
        this.remoteAudio.src = null; 
            
        this.yourConn.close(); 
        this.yourConn.onicecandidate = null; 
        this.yourConn.onaddstream = null; 
    }
}

export {Chat}