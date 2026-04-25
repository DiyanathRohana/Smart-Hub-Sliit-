package com.smartcampus.demo.Repo;

import com.smartcampus.demo.Entity.MaintenanceTicket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceTicketRepo extends MongoRepository<MaintenanceTicket, String> {
    List<MaintenanceTicket> findByRequesterId(String requesterId);
    List<MaintenanceTicket> findByStatus(String status);
    List<MaintenanceTicket> findAllByOrderByCreatedAtDesc();
}
