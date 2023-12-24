app.factory('WebSocketService', function () {
    var stompClient = null;
    var isConnected = false; // Thêm biến để theo dõi trạng thái kết nối
    var subscriptions = {}; // Lưu trữ danh sách các đường dẫn được đăng ký

    function connect(callback) {
        // Kiểm tra nếu đã có kết nối, sử dụng kết nối hiện tại
        if (isConnected) {
            callback();
            return;
        }

        var socket = new SockJS('/notify');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, function (frame) {
            isConnected = true; // Đánh dấu là đã kết nối
            callback();

            // Đăng ký các đường dẫn đã được đăng ký
            for (var path in subscriptions) {
                stompClient.subscribe(path, subscriptions[path]);
            }
        });
    }

    function subscribeToTopic(path, callback) {
        if (isConnected) {
            stompClient.subscribe(path, callback);
        } else {
            // Nếu chưa kết nối, lưu lại đường dẫn và callback để đăng ký sau khi kết nối
            subscriptions[path] = callback;
        }
    }

    return {
        connect: connect,
        subscribeToTopic: subscribeToTopic
    };
});
