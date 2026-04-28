package com.smartcampus.demo.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "user_profiles")
public class UserProfile {

    @Id
    private String _id;
    private String userId;
    private String bio;
    private String profilePictureUrl;
    private String skills; // Comma-separated list of skills
    private String interests; // Comma-separated list of interests
    private int followersCount;
    private int followingCount;
    private int learningPlansCount;
    private Date createdAt;
    private Date updatedAt;
    private String socialMediaLinks; // JSON string containing social media links

    public UserProfile() {
        this.followersCount = 0;
        this.followingCount = 0;
        this.learningPlansCount = 0;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    public UserProfile(String userId, String bio, String profilePictureUrl, 
                      String skills, String interests) {
        this.userId = userId;
        this.bio = bio;
        this.profilePictureUrl = profilePictureUrl;
        this.skills = skills;
        this.interests = interests;
        this.followersCount = 0;
        this.followingCount = 0;
        this.learningPlansCount = 0;
        this.createdAt = new Date();
        this.updatedAt = new Date();
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

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
        this.updatedAt = new Date();
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
        this.updatedAt = new Date();
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
        this.updatedAt = new Date();
    }

    public String getInterests() {
        return interests;
    }

    public void setInterests(String interests) {
        this.interests = interests;
        this.updatedAt = new Date();
    }

    public int getFollowersCount() {
        return followersCount;
    }

    public void setFollowersCount(int followersCount) {
        this.followersCount = followersCount;
    }

    public int getFollowingCount() {
        return followingCount;
    }

    public void setFollowingCount(int followingCount) {
        this.followingCount = followingCount;
    }

    public int getLearningPlansCount() {
        return learningPlansCount;
    }

    public void setLearningPlansCount(int learningPlansCount) {
        this.learningPlansCount = learningPlansCount;
    }

    public int getFacilityAssetsCount() {
        return learningPlansCount;
    }

    public void setFacilityAssetsCount(int facilityAssetsCount) {
        this.learningPlansCount = facilityAssetsCount;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getSocialMediaLinks() {
        return socialMediaLinks;
    }

    public void setSocialMediaLinks(String socialMediaLinks) {
        this.socialMediaLinks = socialMediaLinks;
        this.updatedAt = new Date();
    }
}
