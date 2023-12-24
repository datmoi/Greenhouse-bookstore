app.service('WebSocketService', function ($rootScope) {
    var stompClient = null;

    this.connect = function () {
        var socket = new SockJS('/notify');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, function (frame) {
            console.log("Admin Connected: " + frame);
        });
    };

    this.disconnect = function () {
        if (stompClient !== null) {
            stompClient.disconnect();
        }
        console.log("Disconnected");
    };

    this.sendNotification = function (title, orderCode, username, message) {
        var notification = {
            username: {username: username},
            title: title + " (" + orderCode + ")",
            message: message,
            createAt: new Date()
        };

        if (stompClient !== null && stompClient.connected) {
            stompClient.send("/app/notify/" + username, {}, JSON.stringify(notification));
        } else {
            console.error("WebSocket not connected");
        }
    };
});
