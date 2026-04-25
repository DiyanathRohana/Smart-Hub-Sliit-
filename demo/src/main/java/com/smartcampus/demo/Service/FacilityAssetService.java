package com.smartcampus.demo.Service;

import com.smartcampus.demo.Entity.Resources;
import com.smartcampus.demo.Repo.FacilityAssetRepo;
import com.smartcampus.demo.Entity.UserProfile;
import com.smartcampus.demo.Repo.UserProfileRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Objects;
import java.util.Optional;

@Service
public class FacilityAssetService {

    @Autowired
    private FacilityAssetRepo facilityAssetRepo;
    
    @Autowired
    private UserProfileRepo userProfileRepo;

    public Resources saveFacilityAsset(Resources facilityAsset) {
        // Set creation date if new asset
        if (facilityAsset.get_id() == null) {
            facilityAsset.setCreatedAt(new Date());
            
            // Increment facility assets count in user profile
            UserProfile userProfile = userProfileRepo.findByUserId(facilityAsset.getUserId());
            if (userProfile != null) {
                userProfile.setFacilityAssetsCount(userProfile.getFacilityAssetsCount() + 1);
                userProfileRepo.save(userProfile);
            }
        }
        
        // Always update the updatedAt field
        facilityAsset.setUpdatedAt(new Date());

        return facilityAssetRepo.save(facilityAsset);
    }

    public Iterable<Resources> getAllFacilityAssets() {
        return facilityAssetRepo.findAll();
    }

    public Iterable<Resources> getPublicFacilityAssets() {
        return facilityAssetRepo.findByIsPublic(true);
    }

    public Iterable<Resources> getFacilityAssetsByUserId(String userId) {
        return facilityAssetRepo.findByUserId(userId);
    }

    public Iterable<Resources> getPublicFacilityAssetsByUserId(String userId) {
        return facilityAssetRepo.findByUserIdAndIsPublic(userId, true);
    }

    public Iterable<Resources> getFacilityAssetsByStatus(String status) {
        return facilityAssetRepo.findByStatus(status);
    }

    public Iterable<Resources> getFacilityAssetsByUserIdAndStatus(String userId, String status) {
        return facilityAssetRepo.findByUserIdAndStatus(userId, status);
    }

    public Optional<Resources> getFacilityAssetById(String id) {
        return facilityAssetRepo.findById(Objects.requireNonNull(id, "id must not be null"));
    }

    public void deleteFacilityAsset(String id) {
        String safeId = Objects.requireNonNull(id, "id must not be null");
        Optional<Resources> facilityAssetOpt = facilityAssetRepo.findById(safeId);
        if (facilityAssetOpt.isPresent()) {
            Resources facilityAsset = facilityAssetOpt.get();
            
            // Decrement facility assets count in user profile
            UserProfile userProfile = userProfileRepo.findByUserId(facilityAsset.getUserId());
            if (userProfile != null && userProfile.getFacilityAssetsCount() > 0) {
                userProfile.setFacilityAssetsCount(userProfile.getFacilityAssetsCount() - 1);
                userProfileRepo.save(userProfile);
            }
            
            facilityAssetRepo.deleteById(safeId);
        }
    }

}

