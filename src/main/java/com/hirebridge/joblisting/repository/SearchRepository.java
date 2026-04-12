package com.hirebridge.joblisting.repository;

import java.util.List;

import com.hirebridge.joblisting.model.Post;

public interface SearchRepository {

    List<Post> findByText(String text);

}
