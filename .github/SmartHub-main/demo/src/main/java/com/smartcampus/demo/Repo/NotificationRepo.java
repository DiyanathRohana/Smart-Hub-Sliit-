package com.smartcampus.demo.Repo;

import com.smartcampus.demo.Entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepo extends MongoRepository<Notification, String> {
    Iterable<Notification> findByUserId(String userId);
    Iterable<Notification> findByUserIdAndIsRead(String userId, boolean isRead);
    Iterable<Notification> findByResourceId(String resourceId);
    Iterable<Notification> findByResourceIdAndResourceType(String resourceId, String resourceType);
    long countByUserIdAndIsRead(String userId, boolean isRead);
}
