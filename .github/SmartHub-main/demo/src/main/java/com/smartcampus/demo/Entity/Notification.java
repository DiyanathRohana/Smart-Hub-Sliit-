package com.smartcampus.demo.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "notifications")
public class Notification {

    @Id
    private String _id;
    private String userId; // User who will receive the notification
    private String message;
    private String type; // "COMMENT", "FOLLOW", etc.
    private String resourceId; // ID of the related resource (post, comment, etc.)
    private String resourceType; // Type of resource (e.g., "LEARNING_PLAN", "COURSE")
    private String actorId; // User who triggered the notification
    private String actorUsername; // Username of the user who triggered the notification
    private boolean isRead;
    private Date createdAt;

    public Notification() {
        this.isRead = false;
        this.createdAt = new Date();
    }

    public Notification(String userId, String message, String type, String resourceId, 
                       String resourceType, String actorId, String actorUsername) {
        this.userId = userId;
        this.message = message;
        this.type = type;
        this.resourceId = resourceId;
        this.resourceType = resourceType;
        this.actorId = actorId;
        this.actorUsername = actorUsername;
        this.isRead = false;
        this.createdAt = new Date();
    }

    // Getters and Setters
    public String get_id() {
        return _id;
    }

    public void set_id(String _id) {
        this._id = _id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getResourceId() {
        return resourceId;
    }

    public void setResourceId(String resourceId) {
        this.resourceId = resourceId;
    }

    public String getResourceType() {
        return resourceType;
    }

    public void setResourceType(String resourceType) {
        this.resourceType = resourceType;
    }

    public String getActorId() {
        return actorId;
    }

    public void setActorId(String actorId) {
        this.actorId = actorId;
    }

    public String getActorUsername() {
        return actorUsername;
    }

    public void setActorUsername(String actorUsername) {
        this.actorUsername = actorUsername;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
}
