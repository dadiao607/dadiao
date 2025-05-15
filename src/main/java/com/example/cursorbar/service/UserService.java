package com.example.cursorbar.service;

import com.example.cursorbar.entity.User;
import java.util.Optional;

public interface UserService {
    Optional<User> findByUsername(String username);
    User save(User user);
    boolean authenticate(String username, String password);
} 