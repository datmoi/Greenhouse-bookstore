package com.greenhouse.restcontroller.client;

import java.util.HashMap;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.greenhouse.model.Notification;
import com.greenhouse.repository.NotificationRepository;

@CrossOrigin("*")
@RestController
// @RequestMapping("/customer")
public class NotifyRestController {

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/customer/rest/notifications/{username}")
    public ResponseEntity<List<Notification>> getNotificationsByStatus(@PathVariable String username) {
        List<Notification> notifications = notificationRepository
                .findByUsernameUsernameOrderByStatusAscCreateAtDesc(username);
        return ResponseEntity.ok(notifications);
    }

    @MessageMapping("/notify/getNotifications/{username}")
    public void getNotifications(@DestinationVariable String username) {
        List<Notification> notifications = notificationRepository
                .findByUsernameUsernameOrderByStatusAscCreateAtDesc(username);

        // Gửi thông báo đến người dùng
        simpMessagingTemplate.convertAndSend("/topic/notifications", notifications);
    }

    @MessageMapping("/notify/{username}")
    public void sendNotification(@DestinationVariable String username, Notification model) {
        try {
            // Lưu thông báo vào cơ sở dữ liệu
            Notification savedNotification = notificationRepository.save(model);

            // Gửi thông báo đến người dùng chỉ định thông qua WebSocket
            simpMessagingTemplate.convertAndSendToUser(username, "/topic/notification", savedNotification);

        } catch (Exception e) {
            System.out.println("Error sendNotification: " + e);
        }
    }

    @PutMapping("/customer/rest/notifications/{notificationId}/markAsRead")
    public ResponseEntity<String> markNotificationAsRead(@PathVariable int notificationId) {
        Optional<Notification> optionalNotification = notificationRepository.findById(notificationId);

        if (optionalNotification.isPresent()) {
            Notification notification = optionalNotification.get();
            notification.setStatus(true); // Đặt status thành true (đã đọc)
            notificationRepository.save(notification);
            return new ResponseEntity<>("Notification marked as read.", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Notification not found.", HttpStatus.NOT_FOUND);
        }
    }

    // @MessageMapping("/notify")
    // public void sendNotification(Notification model) {
    // // Lưu thông báo vào cơ sở dữ liệu
    // notificationRepository.save(model);

    // // Gửi thông báo đến người dùng tới "/topic/notifications/{username}"
    // simpMessagingTemplate.convertAndSend("/topic/notifications/" +
    // model.getUsername().getUsername(), model);
    // }

}
