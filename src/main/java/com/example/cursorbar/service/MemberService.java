package com.example.cursorbar.service;

import com.example.cursorbar.entity.Member;
import com.example.cursorbar.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class MemberService {
    @Autowired
    private MemberRepository memberRepository;

    public List<Member> findAll() {
        return memberRepository.findAll();
    }

    public Optional<Member> findById(Long id) {
        return memberRepository.findById(id);
    }

    public Optional<Member> findByPhone(String phone) {
        return Optional.ofNullable(memberRepository.findByPhone(phone));
    }

    public Optional<Member> findByEmail(String email) {
        return Optional.ofNullable(memberRepository.findByEmail(email));
    }

    @Transactional
    public Member save(Member member) {
        return memberRepository.save(member);
    }

    @Transactional
    public void deleteById(Long id) {
        memberRepository.deleteById(id);
    }

    @Transactional
    public Member addPoints(Long memberId, Integer points) {
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new RuntimeException("会员不存在"));
        member.setPoints(member.getPoints() + points);
        return memberRepository.save(member);
    }

    @Transactional
    public Member addConsumption(Long memberId, BigDecimal amount) {
        Member member = memberRepository.findById(memberId)
            .orElseThrow(() -> new RuntimeException("会员不存在"));
        member.setTotalConsumption(member.getTotalConsumption().add(amount));
        return memberRepository.save(member);
    }
} 