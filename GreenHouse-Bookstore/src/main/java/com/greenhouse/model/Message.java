package com.greenhouse.model;

import java.io.Serializable;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Message")
public class Message implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Message_Id")
    private int messageId;

    @ManyToOne
    @JoinColumn(name = "Conversation_Id")
    private Conversation conversation;

    @ManyToOne
    @JoinColumn(name = "Username")
    private Accounts username;

    @Column(name = "Message_Content", columnDefinition = "nvarchar(max)")
    private String messageContent;

    // Các phương thức getters và setters đã được tự động tạo bởi Lombok.
}
