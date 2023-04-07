package org.espresso.barista;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class SolidIndex {

    private String term;
    private String address;
    private int relevancy;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    public SolidIndex(String term, String address, int relevancy) {
        this.term = term;
        this.address = address;
        this.relevancy = relevancy;
    }

    public SolidIndex() {

    }

    public void setTerm(String term) {
        this.term = term;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public void setRelevancy(int relevancy) {
        this.relevancy = relevancy;
    }

    public String getTerm() {
        return term;
    }

    public String getAddress() {
        return address;
    }

    public int getRelevancy() {
        return relevancy;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @Id
    public Long getId() {
        return id;
    }

}
