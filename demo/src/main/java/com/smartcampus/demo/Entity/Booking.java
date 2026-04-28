package com.smartcampus.demo.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "bookings")
public class Booking {

    @Id
    private String _id;

    // Resource being booked
    private String resourceId;
    private String resourceTitle;

    // Requester
    private String userId;
    private String username;

    // Booking details
    private String date;        // "YYYY-MM-DD"
    private String startTime;   // "HH:MM"
    private String endTime;     // "HH:MM"
    private String purpose;
    private int expectedAttendees;

    // Status: PENDING, APPROVED, REJECTED
    private String status;
    private String rejectionReason;
    private String statusUpdatedBy;
    private Date statusUpdatedAt;

    private Date createdAt;
    private Date updatedAt;

    public Booking() {
        this.status = "PENDING";
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    public String get_id() { return _id; }
    public void set_id(String _id) { this._id = _id; }

    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }

    public String getResourceTitle() { return resourceTitle; }
    public void setResourceTitle(String resourceTitle) { this.resourceTitle = resourceTitle; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public int getExpectedAttendees() { return expectedAttendees; }
    public void setExpectedAttendees(int expectedAttendees) { this.expectedAttendees = expectedAttendees; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getStatusUpdatedBy() { return statusUpdatedBy; }
    public void setStatusUpdatedBy(String statusUpdatedBy) { this.statusUpdatedBy = statusUpdatedBy; }

    public Date getStatusUpdatedAt() { return statusUpdatedAt; }
    public void setStatusUpdatedAt(Date statusUpdatedAt) { this.statusUpdatedAt = statusUpdatedAt; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
}
