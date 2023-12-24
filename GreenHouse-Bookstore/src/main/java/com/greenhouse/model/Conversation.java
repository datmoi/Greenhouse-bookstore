package com.greenhouse.model;

import java.io.Serializable;
import java.util.Date;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Conversation")
public class Conversation implements Serializable{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Conversation_Id")
    private int conversationId;

    @Column(name = "Conversation_Date")
    private Date conversationDate;

    @ManyToOne
    @JoinColumn(name = "Username")
    private Accounts account;

    // Constructors, getters, and setters
}
