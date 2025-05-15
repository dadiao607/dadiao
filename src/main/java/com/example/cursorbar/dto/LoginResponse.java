package com.example.cursorbar.dto;

import com.example.cursorbar.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    private String token;
    private String username;
    private String role;
    private String realName;
    private Long userId;
    
    public LoginResponse(String token, User user) {
        this.token = token;
        this.username = user.getUsername();
        this.role = user.getRole();
        this.realName = user.getRealName();
        this.userId = user.getId();
    }
} 