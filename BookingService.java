package com.smartcampus.demo.Service;

import com.smartcampus.demo.Entity.Booking;
import com.smartcampus.demo.Repo.BookingRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Set;

@Service
public class BookingService {

    private static final Set<String> VALID_STATUSES = Set.of("PENDING", "APPROVED", "REJECTED");

    @Autowired
    private BookingRepo bookingRepo;

    public Booking createBooking(Booking booking) {
        booking.setStatus("PENDING");
        booking.setCreatedAt(new Date());
        booking.setUpdatedAt(new Date());
        return bookingRepo.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepo.findAllByOrderByCreatedAtDesc();
    }

    public List<Booking> getBookingsByUser(String userId) {
        return bookingRepo.findByUserId(userId);
    }

    public List<Booking> getBookingsByResource(String resourceId) {
        return bookingRepo.findByResourceId(resourceId);
    }

    public Booking findById(String id) {
        return bookingRepo.findById(id).orElse(null);
    }

    public boolean deleteBooking(String id) {
        if (!bookingRepo.existsById(id)) {
            return false;
        }
        bookingRepo.deleteById(id);
        return true;
    }

    public Booking updateStatus(String id, String status, String updatedBy, String rejectionReason) {
        if (!VALID_STATUSES.contains(status)) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }
        if ("REJECTED".equals(status) && (rejectionReason == null || rejectionReason.isBlank())) {
            throw new IllegalArgumentException("Rejection reason is required when status is REJECTED");
        }
        Booking booking = bookingRepo.findById(id).orElse(null);
        if (booking == null) {
            return null;
        }
        booking.setStatus(status);
        booking.setRejectionReason("REJECTED".equals(status) ? rejectionReason.trim() : null);
        booking.setStatusUpdatedBy(updatedBy);
        booking.setStatusUpdatedAt(new Date());
        booking.setUpdatedAt(new Date());
        return bookingRepo.save(booking);
    }
}
