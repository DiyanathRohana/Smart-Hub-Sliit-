package com.smartcampus.demo.Service;

import com.smartcampus.demo.Entity.User;
import com.smartcampus.demo.Repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Objects;

@Service
public class UserService {

    @Autowired
    private UserRepo userRepo;

    public User registerUser(User user) {
        User safeUser = Objects.requireNonNull(user, "user must not be null");
        // In a real application, you would hash the password here
        if (safeUser.getCreatedAt() == null) {
            safeUser.setCreatedAt(new Date());
        }
        safeUser.setLastLogin(new Date());
        return userRepo.save(safeUser);
    }

    public User findByUsername(String username) {
        return userRepo.findByUsername(username);
    }

    public User findByEmail(String email) {
        return userRepo.findByEmail(email);
    }

    public boolean existsByUsername(String username) {
        return userRepo.findByUsername(username) != null;
    }

    public boolean existsByEmail(String email) {
        return userRepo.findByEmail(email) != null;
    }

    public User findById(String id) {
        return userRepo.findById(id).orElse(null);
    }

    public User updateUser(User user) {
        return userRepo.save(user);
    }

    public boolean deleteUser(String id) {
        if (!userRepo.existsById(id)) {
            return false;
        }
        userRepo.deleteById(id);
        return true;
    }

    public List<User> getAllUsers() {
        return userRepo.findAll();
    }
}
