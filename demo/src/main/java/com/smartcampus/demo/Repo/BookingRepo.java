package com.smartcampus.demo.Repo;

import com.smartcampus.demo.Entity.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepo extends MongoRepository<Booking, String> {
    List<Booking> findByUserId(String userId);
    List<Booking> findByResourceId(String resourceId);
    List<Booking> findAllByOrderByCreatedAtDesc();
}
