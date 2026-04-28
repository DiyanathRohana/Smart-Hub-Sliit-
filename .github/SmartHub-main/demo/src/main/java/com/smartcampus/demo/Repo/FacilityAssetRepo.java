package com.smartcampus.demo.Repo;

import com.smartcampus.demo.Entity.Resources;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FacilityAssetRepo extends MongoRepository<Resources, String> {
    Iterable<Resources> findByUserId(String userId);
    Iterable<Resources> findByIsPublic(boolean isPublic);
    Iterable<Resources> findByUserIdAndIsPublic(String userId, boolean isPublic);
    Iterable<Resources> findByStatus(String status);
    Iterable<Resources> findByUserIdAndStatus(String userId, String status);
}