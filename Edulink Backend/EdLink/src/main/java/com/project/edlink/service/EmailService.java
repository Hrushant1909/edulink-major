package com.project.edlink.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOTPEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@edulink.com");
            message.setTo(toEmail);
            message.setSubject("Password Reset OTP - EduLink");
            message.setText("Your OTP for password reset is: " + otp + "\n\n" +
                    "This OTP is valid for 10 minutes.\n\n" +
                    "If you did not request this, please ignore this email.");
            
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Error sending email: " + e.getMessage());
            throw new RuntimeException("Failed to send OTP email");
        }
    }
}

