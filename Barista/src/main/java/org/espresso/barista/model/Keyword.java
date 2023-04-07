package org.espresso.barista.model;

import javax.persistence.*;

@Entity
@Table(name = "Keyword")
public class Keyword {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String term;
    private String address;
    private Long relevancy;

    public Keyword(Long id, String term, String address, long relevancy) {
        this.id = id;
        this.term = term;
        this.address=address;
        this.relevancy=relevancy;
    }



    public Keyword() {

    }
// Getters and setters

        public Long getRelevancy() {
        return relevancy;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getAddress() {
        return address;
    }

    public void setRelevancy(Long relevancy) {
        this.relevancy = relevancy;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTerm() {
        return term;
    }

    public void setTerm(String term) {
        this.term = term;
    }
}
