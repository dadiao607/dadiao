package com.example.cursorbar.repository;

import com.example.cursorbar.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    Member findByPhone(String phone);
    Member findByEmail(String email);
} 