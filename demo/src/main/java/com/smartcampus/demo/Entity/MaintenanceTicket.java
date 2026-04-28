package com.smartcampus.demo.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Document(collection = "maintenance_tickets")
public class MaintenanceTicket {

    @Id
    private String _id;

    // Resource / location being reported
    private String resource;

    // Category: ELECTRICAL, PLUMBING, IT, HVAC, STRUCTURAL, OTHER
    private String category;

    private String description;

    // Priority: LOW, MEDIUM, HIGH
    private String priority;

    // Contact details of the requester
    private String contact;

    // Status: OPEN, IN_PROGRESS, RESOLVED, CLOSED
    private String status;

    // Set by technician
    private String technicianResolutionNotes;

    // Filenames of attached images
    private List<String> images;

    // Requester info
    private String requesterId;
    private String requesterName;

    private Date createdAt;
    private Date updatedAt;

    public MaintenanceTicket() {
        this.status = "OPEN";
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public String get_id() { return _id; }
    public void set_id(String _id) { this._id = _id; }

    public String getResource() { return resource; }
    public void setResource(String resource) { this.resource = resource; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTechnicianResolutionNotes() { return technicianResolutionNotes; }
    public void setTechnicianResolutionNotes(String technicianResolutionNotes) {
        this.technicianResolutionNotes = technicianResolutionNotes;
    }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }

    public String getRequesterId() { return requesterId; }
    public void setRequesterId(String requesterId) { this.requesterId = requesterId; }

    public String getRequesterName() { return requesterName; }
    public void setRequesterName(String requesterName) { this.requesterName = requesterName; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
}
