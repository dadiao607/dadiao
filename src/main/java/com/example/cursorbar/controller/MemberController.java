package com.example.cursorbar.controller;

import com.example.cursorbar.common.Result;
import com.example.cursorbar.entity.Member;
import com.example.cursorbar.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
public class MemberController {
    @Autowired
    private MemberService memberService;

    @GetMapping
    public Result<List<Member>> getAllMembers() {
        return Result.success(memberService.findAll());
    }

    @GetMapping("/{id}")
    public Result<Member> getMemberById(@PathVariable Long id) {
        return memberService.findById(id)
                .map(Result::success)
                .orElse(Result.error("会员不存在"));
    }

    @PostMapping
    public Result<Member> createMember(@RequestBody Member member) {
        return Result.success(memberService.save(member));
    }

    @PutMapping("/{id}")
    public Result<Member> updateMember(@PathVariable Long id, @RequestBody Member member) {
        return memberService.findById(id)
                .map(existingMember -> {
                    member.setId(id);
                    return Result.success(memberService.save(member));
                })
                .orElse(Result.error("会员不存在"));
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteMember(@PathVariable Long id) {
        return memberService.findById(id)
                .map(member -> {
                    memberService.deleteById(id);
                    return Result.success((Void) null);
                })
                .orElse(Result.error("会员不存在"));
    }

    @PutMapping("/{id}/points")
    public Result<Member> updatePoints(@PathVariable Long id, @RequestParam Integer points) {
        try {
            Member updatedMember = memberService.addPoints(id, points);
            return Result.success(updatedMember);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @PutMapping("/{id}/consumption")
    public Result<Member> updateConsumption(@PathVariable Long id, @RequestParam Double amount) {
        try {
            Member updatedMember = memberService.addConsumption(id, java.math.BigDecimal.valueOf(amount));
            return Result.success(updatedMember);
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }
} 