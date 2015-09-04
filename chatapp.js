// Include all required libaries here
var app = require("http").createServer(handler),
    io = require("socket.io").listen(app),
    fs = require("fs");
    redis = require("redis");
    client = redis.createClient();

// Listen to port no:3000 from browser
app.listen(3000);

// Function to render index.html
function handler(req, res) {
    fs.readFile(__dirname + '/index.html',
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }
            res.writeHead(200);
            res.end(data);
        });
}

// Function to store message usin redis
var storeMessage=function(data){
  var message = JSON.stringify({data:data});
  client.lpush("messages",message,function(err, response){
  client.ltrim("messages",0,10000);
  });
}


io.sockets.on('connection', function (socket) {
    //when recieving the data from the server, push the same message to client.
    socket.on("clientMsg", function (data) {

    //send the data to the current client requested/sent.
    socket.emit("serverMsg", data);

    //send the data to all the clients who are acessing the same site(localhost)
    socket.broadcast.emit("serverMsg", data);
    storeMessage(data);
    });

    socket.on("sender", function (data) {
        socket.emit("sender", data);
        socket.broadcast.emit("sender", data);
    });

    socket.on("join", function(data){
        client.lrange("messages",0,-1,function(err, messages){
        messages=messages.reverse();  
        messages.forEach(function(message){
        message = JSON.parse(message);
	socket.emit("serverMsg", message.data);
       });
       });
    });     
});
