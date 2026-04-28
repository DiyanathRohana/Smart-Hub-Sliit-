package com.smartcampus.demo.Service;

import com.smartcampus.demo.Entity.Notification;
import com.smartcampus.demo.Entity.User;
import com.smartcampus.demo.Repo.NotificationRepo;
import com.smartcampus.demo.Repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepo notificationRepo;

    @Autowired
    private UserRepo userRepo;

    public Notification saveNotification(Notification notification) {
        return notificationRepo.save(Objects.requireNonNull(notification, "notification must not be null"));
    }

    public Iterable<Notification> getAllNotifications() {
        return notificationRepo.findAll();
    }

    public Iterable<Notification> getNotificationsByUserId(String userId) {
        return notificationRepo.findByUserId(userId);
    }

    public Iterable<Notification> getUnreadNotificationsByUserId(String userId) {
        return notificationRepo.findByUserIdAndIsRead(userId, false);
    }

    public Optional<Notification> getNotificationById(String id) {
        return notificationRepo.findById(Objects.requireNonNull(id, "id must not be null"));
    }

    public void markNotificationAsRead(String id) {
        Optional<Notification> notificationOpt = notificationRepo.findById(Objects.requireNonNull(id, "id must not be null"));
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setRead(true);
            notificationRepo.save(notification);
        }
    }

    public void markAllNotificationsAsRead(String userId) {
        Iterable<Notification> notifications = notificationRepo.findByUserIdAndIsRead(userId, false);
        for (Notification notification : notifications) {
            notification.setRead(true);
            notificationRepo.save(notification);
        }
    }

    public void deleteNotification(String id) {
        notificationRepo.deleteById(Objects.requireNonNull(id, "id must not be null"));
    }

    public long countUnreadNotifications(String userId) {
        return notificationRepo.countByUserIdAndIsRead(userId, false);
    }

    public void notifyAllUsers(String message, String type, String resourceId, String resourceType,
                               String actorId, String actorUsername) {
        for (User user : userRepo.findAll()) {
            if (user == null || user.get_id() == null) {
                continue;
            }

            Notification notification = new Notification(
                user.get_id(),
                message,
                type,
                resourceId,
                resourceType,
                actorId,
                actorUsername
            );
            notificationRepo.save(notification);
        }
    }
}
