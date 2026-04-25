package com.smartcampus.demo.Repo;

import com.smartcampus.demo.Entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepo extends MongoRepository<User, String> {
    User findByUsername(String username);
    User findByEmail(String email);
}
